import { now, parseDate, toCalendarDateTime } from "@internationalized/date";
import { parse as parseHTML } from "node-html-parser";
import nodeFetch, { RequestInfo, RequestInit, Response } from "node-fetch";
import makeFetchCookie, { FetchCookieImpl } from "fetch-cookie";
import crypto from "node:crypto";

export async function downloadPdf() {
  const fetch = makeFetchCookie(nodeFetch);
  await itslearningLogin(fetch);

  // Function to select the correct file
  const selector = (elements: ItslearningResourceElement[]) => elements[0];

  // Get information for file download
  // If there's no file, return null
  try {
    var { url, filename } = await getItslearningDownloadInfo(fetch, selector);
  } catch {
    return null;
  }

  // Get date from filename
  const dateString = /\d{2}\.\d{2}\.\d{4}/
    .exec(filename)?.[0]
    .split(".")
    .reverse()
    .join("-");

  const date = dateString ? parseDate(dateString) : null;

  const { hash, changed, fetchedAt } = await downloadFile(fetch, url);

  return { changed, date, fetchedAt, hash };
}

async function itslearningLogin(
  fetch: FetchCookieImpl<URL | RequestInfo, RequestInit, Response>
) {
  // Fetch ViewState and EventValidation

  const itsHomepage = await fetch("https://mv.itslearning.com/")
    .then((r) => r.text())
    .then(parseHTML);

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

  const formData = new URLSearchParams();
  formData.append(
    "__EVENTTARGET",
    "ctl00$ContentPlaceHolder1$federatedLoginButtons$ctl00$ctl00"
  );
  formData.append("__VIEWSTATE", viewState);
  formData.append("__VIEWSTATEGENERATOR", "90059987");
  formData.append("__EVENTVALIDATION", eventValidation);

  const viewStateRedirectUrl = await fetch("https://mv.itslearning.com/", {
    method: "POST",
    redirect: "manual",
    body: formData,
  }).then((r) => r.headers.get("location"));
  if (!viewStateRedirectUrl)
    throw new Error("ViewState redirect URL is missing");

  const redirectResp = await fetch(viewStateRedirectUrl, {
    redirect: "manual",
  });

  const authStateUrl = redirectResp.headers.get("location");
  const authState =
    authStateUrl && new URL(authStateUrl).searchParams.get("AuthState");

  if (!authState) throw new Error("Server did not return AuthState");

  // Initialize login

  if (!process.env.USERNAME || !process.env.PASSWORD) {
    throw new Error("Missing credentials");
  }

  const loginFormData = new URLSearchParams();
  loginFormData.append("username", process.env.USERNAME);
  loginFormData.append("password", process.env.PASSWORD);
  loginFormData.append("AuthState", authState);
  loginFormData.append("submit", "");

  const authResponseData = await fetch(
    "https://ucs-sso.schule-mv.de/simplesamlphp/module.php/core/loginuserpass.php",
    { method: "POST", body: loginFormData }
  )
    .then((r) => r.text())
    .then(parseHTML);

  // Handle SAMLResponse

  const samlResponse = authResponseData.querySelector(
    `input[name="SAMLResponse"]`
  )?.attrs["value"];
  const relayState = authResponseData.querySelector(`input[name="RelayState"]`)
    ?.attrs["value"];

  if (!samlResponse || !relayState)
    throw new Error("Server response is missing SAMLResponse or RelayState");

  const assertionConsumerServiceForm = new URLSearchParams();
  assertionConsumerServiceForm.append("SAMLResponse", samlResponse);
  assertionConsumerServiceForm.append("RelayState", relayState);

  await fetch(
    "https://mv.itslearning.com/eLogin/AssertionConsumerService.aspx",
    { method: "POST", body: assertionConsumerServiceForm }
  );
}

async function getItslearningDownloadInfo(
  fetch: FetchCookieImpl<URL | RequestInfo, RequestInit, Response>,
  fileSelector: (a: ItslearningResourceElement[]) => ItslearningResourceElement
) {
  const folderId = 587784;

  const folderResp = await fetch(
    `https://mv.itslearning.com/restapi/resources/folder/${folderId}/v1`
  )
    .then((r) => r.text())
    .then(JSON.parse);

  const element = fileSelector(folderResp.folderElements.elements);
  if (!element) throw new Error("folderElements not found");

  const fileView = await fetch(
    `https://mv.itslearning.com${element.elementUrl}`,
    { redirect: "manual" }
  )
    .then((r) => r.text())
    .then(parseHTML);

  const loginSsoUrl = fileView
    .querySelector(
      `iframe[src^="https://platform.itslearning.com/LoginSSO.aspx"]`
    )
    ?.getAttribute("src");
  if (!loginSsoUrl) throw new Error("LoginSSO URL is missing");

  const redirectLocation = await fetch(loginSsoUrl, {
    redirect: "manual",
  }).then((r) => r.headers.get("location"));

  const learningObjectUrl = await nodeFetch(
    `https://platform.itslearning.com${redirectLocation}`,
    {
      redirect: "manual",
      headers: {
        cookie: await fetch.cookieJar.getCookieString(
          "https://platform.itslearning.com"
        ),
      },
    }
  ).then((r) => r.headers.get("location"));
  if (!learningObjectUrl) throw new Error("LearningObject URL is missing");

  await fetch(learningObjectUrl);

  const { searchParams: viewFileUrlParams } = new URL(learningObjectUrl);
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
  fetch: FetchCookieImpl<URL | RequestInfo, RequestInit, Response>,
  url: string
) {
  const hashGenerator = crypto.createHash("sha1");

  const fetchedAt = toCalendarDateTime(now("Europe/Berlin"));

  const response = await fetch(url);

  const arrayBuffer = await response.arrayBuffer();
  hashGenerator.update(Buffer.from(arrayBuffer));

  const hash = hashGenerator.digest("hex");

  const upsertResult = await useDrizzle()
    .insert(tables.download)
    .values({
      hash,
      firstFetch: fetchedAt,
      lastFetch: fetchedAt,
    })
    .onConflictDoUpdate({
      target: tables.download.hash,
      set: { lastFetch: fetchedAt },
    });

  const changed = !upsertResult.meta.rows_read;

  if (changed) {
    await hubBlob().put(`plans/${hash}/download.pdf`, arrayBuffer);
  }

  return { changed, hash, fetchedAt };
}
