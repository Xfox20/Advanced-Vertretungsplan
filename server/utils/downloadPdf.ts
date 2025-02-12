import {
  getLocalTimeZone,
  now,
  parseDate,
  toCalendarDateTime,
  today,
} from "@internationalized/date";
import { parse } from "node-html-parser";
import got from "got";
import { CookieJar } from "tough-cookie";
import fs, { mkdirSync } from "fs";
import crypto from "crypto";
import { Transform } from "stream";
import { pipeline } from "stream/promises";

export async function downloadPdf() {
  const cookieJar = new CookieJar();
  await itslearningLogin(cookieJar);

  // Function to select the correct file
  const selector = (elements: ItslearningResourceElement[]) => elements[0];

  // Get information for file download
  // If there's no file, return null
  try {
    var { url, filename } = await getItslearningDownloadInfo(
      cookieJar,
      selector
    );
  } catch {
    return null;
  }

  // Get date from filename
  const dateString = /\d{2}\.\d{2}\.\d{4}/
    .exec(filename)?.[0]
    .split(".")
    .reverse()
    .join("-");

  let date, datePath;
  if (dateString) {
    date = parseDate(dateString);
    datePath = getDatePath(date);
  } else {
    return null;
  }

  mkdirSync(datePath, { recursive: true });

  const fetchedAt = toCalendarDateTime(now("Europe/Berlin"));
  const { hash, changed } = await downloadFile(cookieJar, url, datePath);

  if (!dateString) {
    return null;
  }

  return {
    changed,
    date,
    fetchedAt,
    hash,
  };
}

async function itslearningLogin(cookieJar: CookieJar) {
  // Fetch ViewState and EventValidation

  const indexResp = await got.get("https://mv.itslearning.com/", {
    cookieJar,
  });
  const itsHomepage = parse(indexResp.body);

  const viewState = itsHomepage.querySelector(
    `#aspnetForm input[name="__VIEWSTATE"]`
  )?.attrs["value"];
  const eventValidation = itsHomepage.querySelector(
    `#aspnetForm input[name="__EVENTVALIDATION"]`
  )?.attrs["value"];

  if (!viewState || !eventValidation) {
    throw new Error(
      "itslearning homepage is missing ViewState or EventValidation"
    );
  }

  // Get AuthState

  const formData = {
    __EVENTTARGET:
      "ctl00$ContentPlaceHolder1$federatedLoginButtons$ctl00$ctl00",
    __VIEWSTATE: viewState,
    __VIEWSTATEGENERATOR: "90059987",
    __EVENTVALIDATION: eventValidation,
  };

  const itslearningEntryResponse = await got.post({
    url: "https://mv.itslearning.com/",
    cookieJar,
    followRedirect: false,
    form: formData,
  });
  const redirectUrl = itslearningEntryResponse.headers.location;
  if (!redirectUrl) throw new Error("Redirect URL is missing");

  const redirectResp = await got.get({
    url: redirectUrl,
    cookieJar,
    followRedirect: false,
  });

  if (!redirectResp.headers.location)
    throw new Error("Redirect URL is missing");

  const authState = new URL(redirectResp.headers.location).searchParams.get(
    "AuthState"
  );

  if (!authState) throw new Error("Server did not return AuthState");

  // Initialize login

  if (!process.env.USERNAME || !process.env.PASSWORD) {
    throw new Error("Missing credentials");
  }

  const authResponse = await got.post({
    url: "https://ucs-sso.schule-mv.de/simplesamlphp/module.php/core/loginuserpass.php",
    cookieJar,
    followRedirect: false,
    form: {
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
      AuthState: authState,
      submit: "",
    },
  });

  // Handle SAMLResponse

  const authData = parse(authResponse.body);
  const samlResponse = authData.querySelector(`input[name="SAMLResponse"]`)
    ?.attrs["value"];
  const relayState = authData.querySelector(`input[name="RelayState"]`)?.attrs[
    "value"
  ];

  if (!samlResponse || !relayState)
    throw new Error("Server response is missing SAMLResponse or RelayState");

  await got.post({
    url: "https://mv.itslearning.com/eLogin/AssertionConsumerService.aspx",
    cookieJar,
    followRedirect: false,
    form: {
      SAMLResponse: samlResponse,
      RelayState: relayState,
    },
  });

  // Finalize

  await got.get({
    url: `https://mv.itslearning.com/Index.aspx`,
    cookieJar,
  });
}

async function getItslearningDownloadInfo(
  cookieJar: CookieJar,
  fileSelector: (a: ItslearningResourceElement[]) => ItslearningResourceElement
) {
  const folderId = 587784;

  const folderResp = await got.get({
    url: `https://mv.itslearning.com/restapi/resources/folder/${folderId}/v1`,
    cookieJar,
    followRedirect: false,
  });

  const element = fileSelector(
    JSON.parse(folderResp.body).folderElements.elements
  );

  if (!element) throw new Error("folderElements not found");

  const fileView = await got.get({
    url: `https://mv.itslearning.com${element.elementUrl}`,
    cookieJar,
    followRedirect: false,
  });

  const loginSsoUrl = parse(fileView.body)
    .querySelector(
      `iframe[src^="https://platform.itslearning.com/LoginSSO.aspx"]`
    )
    ?.getAttribute("src");

  const learningObjectInstance = await got.get({
    url: loginSsoUrl,
    cookieJar,
  });
  const viewFileUrlParams = new URL(
    "https://resource.itslearning.com" +
      parse(learningObjectInstance.body)
        .querySelector(`iframe[src^="/ViewFile.aspx"]`)
        ?.getAttribute("src")
  ).searchParams;

  if (!viewFileUrlParams) throw new Error("ViewFile URI is missing");

  const learningObjectId = viewFileUrlParams.get("LearningObjectId");
  const learningObjectInstanceId = viewFileUrlParams.get(
    "LearningObjectInstanceId"
  );

  return {
    url: `https://resource.itslearning.com/Proxy/DownloadRedirect.ashx?LearningObjectId=${learningObjectId}&LearningObjectInstanceId=${learningObjectInstanceId}`,
    filename: element.title,
  };
}

async function downloadFile(
  cookieJar: CookieJar,
  url: string,
  datePath: string
) {
  const fileHash = crypto.createHash("sha1");

  const hashTransform = new Transform({
    transform(chunk, _, callback) {
      fileHash.update(chunk);
      callback(null, chunk);
    },
  });

  const tempPath = `${datePath}/temp.pdf`;
  const fileWriteStream = fs.createWriteStream(tempPath);

  await pipeline(
    got.stream(url, { cookieJar }),
    hashTransform,
    fileWriteStream
  );

  const finalHash = fileHash.digest("hex");

  mkdirSync(`${datePath}/${finalHash}`, { recursive: true });
  const finalPath = `${datePath}/${finalHash}/download.pdf`;

  const changed = !fs.existsSync(finalPath);
  fs.renameSync(tempPath, finalPath);

  return {
    changed,
    hash: finalHash,
    pdfPath: finalPath,
  };
}
