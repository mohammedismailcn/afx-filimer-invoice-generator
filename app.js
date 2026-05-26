const state = {
  events: [
    {
      name: "Bachelor party",
      date: "No date",
      location: "",
      photos: 1,
      videos: 1,
    },
  ],
  outputs: [
    { id: "album", label: "Album", checked: true, type: "album" },
    { id: "function-video", label: "Function video", checked: true },
    { id: "highlight-video", label: "Highlight Video", checked: true },
    { id: "reels-video", label: "Reels Video", checked: true },
    { id: "photo-link", label: "Edited Photo Link (each function)", checked: true },
  ],
  complementary: [],
};

const formatCurrency = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

const numberWords = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four"
];

const elements = {
  clientName: document.querySelector("#clientName"),
  totalAmount: document.querySelector("#totalAmount"),
  albumCount: document.querySelector("#albumCount"),
  albumPageCount: document.querySelector("#albumPageCount"),
  albumLeafCount: document.querySelector("#albumLeafCount"),
  includeTravel: document.querySelector("#includeTravel"),
  includeFood: document.querySelector("#includeFood"),
  includeAccommodation: document.querySelector("#includeAccommodation"),
  eventsList: document.querySelector("#eventsList"),
  outputsList: document.querySelector("#outputsList"),
  complementaryList: document.querySelector("#complementaryList"),
  customOutputText: document.querySelector("#customOutputText"),
  customComplementaryText: document.querySelector("#customComplementaryText"),
  previewClientName: document.querySelector("#previewClientName"),
  previewEvents: document.querySelector("#previewEvents"),
  previewOutputs: document.querySelector("#previewOutputs"),
  previewComplementary: document.querySelector("#previewComplementary"),
  previewTotal: document.querySelector("#previewTotal"),
  previewIncluded: document.querySelector("#previewIncluded"),
  eventTemplate: document.querySelector("#eventTemplate"),
};

function pluralize(count, singular, plural) {
  return `${countToWords(count)} ${count === 1 ? singular : plural}`;
}

function countToWords(count) {
  const safeCount = Math.max(0, Number(count) || 0);
  return numberWords[safeCount] || formatCurrency.format(safeCount);
}

function getSelectedOutputLabels() {
  const albumCount = Number(elements.albumCount.value) || 1;
  const pageCount = Number(elements.albumPageCount.value) || 1;
  const leafCount = Number(elements.albumLeafCount.value) || 1;

  return state.outputs
    .filter((output) => output.checked)
    .map((output) => {
      if (output.type === "album") {
        return `${pluralize(albumCount, "Album", "Albums")} ${pageCount} pages, ${leafCount} leaf`;
      }
      return output.label;
    });
}

function isAlbumSelected() {
  return state.outputs.some((output) => output.type === "album" && output.checked);
}

function renderEventsForm() {
  elements.eventsList.innerHTML = "";

  state.events.forEach((event, index) => {
    const node = elements.eventTemplate.content.firstElementChild.cloneNode(true);
    const title = node.querySelector("strong");
    const removeButton = node.querySelector(".remove-event");
    const nameInput = node.querySelector(".event-name");
    const dateInput = node.querySelector(".event-date");
    const locationInput = node.querySelector(".event-location");
    const photoInput = node.querySelector(".photo-count");
    const videoInput = node.querySelector(".video-count");

    title.textContent = `Event ${index + 1}`;
    nameInput.value = event.name;
    dateInput.value = event.date;
    locationInput.value = event.location;
    photoInput.value = event.photos;
    videoInput.value = event.videos;
    removeButton.hidden = state.events.length <= 1;

    const syncEvent = () => {
      const photos = Number(photoInput.value) || 0;
      const videos = Number(videoInput.value) || 0;

      state.events[index] = {
        name: nameInput.value,
        date: dateInput.value,
        location: locationInput.value,
        photos,
        videos,
      };

      node.classList.toggle("is-invalid", photos + videos < 1);
      renderPreview();
    };

    [nameInput, dateInput, locationInput, photoInput, videoInput].forEach((input) => {
      input.addEventListener("input", syncEvent);
    });

    removeButton.addEventListener("click", () => {
      state.events.splice(index, 1);
      renderEventsForm();
      renderPreview();
    });

    node.classList.toggle("is-invalid", event.photos + event.videos < 1);
    elements.eventsList.append(node);
  });
}

function renderOutputsForm() {
  elements.outputsList.innerHTML = "";

  state.outputs.forEach((output) => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = output.checked;
    checkbox.addEventListener("change", () => {
      output.checked = checkbox.checked;
      renderPreview();
    });

    label.append(checkbox, document.createTextNode(output.label));
    elements.outputsList.append(label);
  });
}

function renderComplementaryForm() {
  elements.complementaryList.innerHTML = "";

  state.complementary.forEach((complementary) => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = complementary.checked;
    checkbox.addEventListener("change", () => {
      complementary.checked = checkbox.checked;
      renderPreview();
    });

    label.append(checkbox, document.createTextNode(complementary.label));
    elements.complementaryList.append(label);
  });
}

function renderPreview() {
  elements.previewClientName.textContent = elements.clientName.value.trim() || "Client";
  elements.previewEvents.innerHTML = "";
  elements.previewOutputs.innerHTML = "";
  elements.previewComplementary.innerHTML = "";

  state.events.forEach((event) => {
    const row = document.createElement("tr");
    const dateCell = document.createElement("td");
    const eventCell = document.createElement("td");
    const cameraCell = document.createElement("td");
    const locationCell = document.createElement("td");
    const cameraWrapper = document.createElement("div");
    const cameraLines = [];

    if (event.photos > 0) {
      cameraLines.push(pluralize(event.photos, "photographer", "photographers"));
    }

    if (event.videos > 0) {
      cameraLines.push(pluralize(event.videos, "videographer", "videographers"));
    }

    cameraWrapper.className = "camera-lines";
    cameraLines.forEach((line) => {
      const span = document.createElement("span");
      span.textContent = line;
      cameraWrapper.append(span);
    });

    dateCell.textContent = event.date.trim() || "No date";
    eventCell.textContent = event.name.trim() || "Event";
    cameraCell.append(cameraWrapper);
    locationCell.textContent = event.location.trim();
    row.append(dateCell, eventCell, cameraCell, locationCell);
    elements.previewEvents.append(row);
  });

  getSelectedOutputLabels().forEach((label) => {
    const item = document.createElement("li");
    item.textContent = label;
    elements.previewOutputs.append(item);
  });

  const complementaryItems = [];
  if (isAlbumSelected()) {
    const count = Number(elements.albumCount.value) || 1;
    complementaryItems.push(pluralize(count, "mini album", "mini albums"));
    complementaryItems.push(pluralize(count, "Calendar", "Calendars"));
    complementaryItems.push(pluralize(count, "Photo Frame", "Photo Frames"));
    complementaryItems.push("Output in pendrive");
  } else {
    complementaryItems.push("One Photo Frame", "Output in pendrive");
  }

  state.complementary
    .filter((complementary) => complementary.checked)
    .forEach((complementary) => complementaryItems.push(complementary.label));

  complementaryItems.forEach((label) => {
    const item = document.createElement("li");
    item.textContent = label;
    elements.previewComplementary.append(item);
  });

  elements.previewTotal.textContent = formatCurrency.format(Number(elements.totalAmount.value) || 0);

  const included = [];
  if (elements.includeTravel.checked) included.push("travel");
  if (elements.includeFood.checked) included.push("food");
  if (elements.includeAccommodation.checked) included.push("accommodation");

  elements.previewIncluded.textContent = included.length ? ` (Include ${included.join(", ")})` : "";
}

function addEvent() {
  state.events.push({
    name: "",
    date: "",
    location: "",
    photos: 1,
    videos: 0,
  });
  renderEventsForm();
  renderPreview();
}

function addCustomOutput() {
  const label = elements.customOutputText.value.trim();
  if (!label) return;

  state.outputs.push({
    id: `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    label,
    checked: true,
  });
  elements.customOutputText.value = "";
  renderOutputsForm();
  renderPreview();
}

function addCustomComplementary() {
  const label = elements.customComplementaryText.value.trim();
  if (!label) return;

  state.complementary.push({
    id: `custom-complementary-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    label,
    checked: true,
  });
  elements.customComplementaryText.value = "";
  renderComplementaryForm();
  renderPreview();
}

function getPageStyles() {
  return Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join("\n");
      } catch (error) {
        return "";
      }
    })
    .join("\n");
}

function getInvoiceFileName() {
  const client = elements.clientName.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `invoice-${client || "client"}.png`;
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function getEmailTemplateHtml(imageDataUrl) {
  return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.45; color: #111;">
      <p>Thank you for choosing Afxfilmer,<br>We are grateful for the trust you have placed in us:</p>
      <p><img src="${imageDataUrl}" alt="image.png" style="display: block; max-width: 100%; height: auto;"></p>
      <p>The total package amount is ₹80,000 out of which ₹8,000 has been paid as advance. An amount of ₹62,000 is to be paid after the function, and the remaining ₹10,000 will be due after the album selection. If you need any further clarification, please feel free to contact us.</p>
      <p>You Can Google Pay on 8129388309<br>OR<br>Account Holder: fasal sainudheen<br>Account number:99980111663659<br>IFSC:FDRL0001371<br>KALADY BRANCH</p>
      <p>Terms and Conditions:</p>
      <p>1. The delivery time is estimated to be 15 to 45 days from the date of selection of photographs or after the post-wedding shoot, whichever comes first. We expect to receive the sorting within 1 week,<br>But be informed, that designing and editing is a form of art. Sometimes it takes more time than we expect to bring out an output up to our standards.<br>The client needs to select the photos and confirm the design within the stipulated time and follow up with our post-production department to make the process faster and more prompt.</p>
      <p>2. The sorting of pictures for albums by the client can be done in 2 ways: either the client should select all the pictures from the raw file for the entire album or select the group pictures. that will help in minimizing corrections.</p>
      <p>3. Expenses relating to any USB drives /hard disks/ couriers used in the process of transfer of raw media files other than the usual output shall be borne by the client.</p>
      <p>4. The first five correction sessions (for the album) are free of charge. Any additional correction sessions will be charged based on the time consumed.</p>
      <p>5. We block our dates for you, only on the receipt of the booking advance. so kindly reserve your dates at the earliest to avoid disappointments of any sort, as dates are the most important factor in demand in the wedding industry.</p>
      <p>6. All communication both verbal and texting to be confirmed through the mail.</p>
      <p>7. Extra pages in the album, if required by the client, would be charged at Rs 650/- per page.</p>
      <p>8, You will get limited edited photos as complimentary. After that, every photo will be charged RS 100 per photo.</p>
      <p>9. The client is to name one contact person who will confirm every step of the project. This is to avoid any contradictory instructions from the client or close relations. so, any suggestions,<br>instructions and corrections have to come through/with the knowledge of the contact person.</p>
      <p>10. The final settlement has to be cleared before shipping if the client chooses to courier the final deliverables.</p>
      <p>11. We provide complimentary items such as Calendars, Photo frames, candid albums, etc. However, the client cannot suggest or choose any of the items.<br>Since these are complimentary items, the editor will choose according to his will.</p>
      <p>12. Drone ( Helicam ) Live video/Printing /Led Screen are services that are not included in the package, and if required at the time of project confirmation should be made & will be charged extra.<br>Requirements like Live Telecasting and Drone sometimes will face Network issues, connectivity problems, low signal strength, Red zone area,,Etc.., so we do these requirements Only if you are interested.</p>
      <p>13. If a client needs to set up live video streaming at the venue, kindly be informed that the cams we use do not support the same, and therefore will have to use a separate camera for the same.<br>Please make sure that you inform us of the requirements at the time of confirmation, and the service charges will apply.</p>
      <p>14. We will be requiring a power output of not more than 1000W for lighting purposes at the location of the event.</p>
      <p>15. If the client is going to select entire pictures then the point to be noted is for 100 pages of the album the number of pictures required to be sorted is around 300 from a total 5000 to 20000 pictures per day shoot.</p>
      <p>16. Data will be kept only for 1 month after the Delivery, so please collect it on your hard drive as soon as possible</p>
      <p>17. For Full video and highlights if the client has any specific song/track selection the client has to provide the link of the song and should confirm the same after the selection of the package.<br>and if the client does not have any selection regarding the song and track then your video editor’s selection is taken for the same and any changes further in that will be chargeable.</p>
      <p>18. The song in the full video or highlights is not recommended or suggested by the client due to no selection regarding the same, if used by our video editor and is not relevant to the video then it will be our correction and not payable.</p>
      <p>19. This quote is valid only if you confirm the dates before 30 days from this mail or if said dates are not booked before you.</p>
      <p>20. In the event of cancellation of any function by the client, the agreed package price shall remain unchanged and no reduction will be applicable. Exceptions will only be considered in cases arising due to issues from our side .</p>
      <p>21.  We do not have any hidden charges.</p>
      <p>THANKYOU!</p>
    </div>
  `;
}

function getEmailTemplateText() {
  return `Thank you for choosing Afxfilmer,
We are grateful for the trust you have placed in us:

image.png

The total package amount is ₹80,000 out of which ₹8,000 has been paid as advance. An amount of ₹62,000 is to be paid after the function, and the remaining ₹10,000 will be due after the album selection. If you need any further clarification, please feel free to contact us.

You Can Google Pay on 8129388309
OR
Account Holder: fasal sainudheen
Account number:99980111663659
IFSC:FDRL0001371
KALADY BRANCH

Terms and Conditions:

1. The delivery time is estimated to be 15 to 45 days from the date of selection of photographs or after the post-wedding shoot, whichever comes first. We expect to receive the sorting within 1 week,
But be informed, that designing and editing is a form of art. Sometimes it takes more time than we expect to bring out an output up to our standards.
The client needs to select the photos and confirm the design within the stipulated time and follow up with our post-production department to make the process faster and more prompt.
2. The sorting of pictures for albums by the client can be done in 2 ways: either the client should select all the pictures from the raw file for the entire album or select the group pictures. that will help in minimizing corrections.
3. Expenses relating to any USB drives /hard disks/ couriers used in the process of transfer of raw media files other than the usual output shall be borne by the client.
4. The first five correction sessions (for the album) are free of charge. Any additional correction sessions will be charged based on the time consumed.
5. We block our dates for you, only on the receipt of the booking advance. so kindly reserve your dates at the earliest to avoid disappointments of any sort, as dates are the most important factor in demand in the wedding industry.
6. All communication both verbal and texting to be confirmed through the mail.
7. Extra pages in the album, if required by the client, would be charged at Rs 650/- per page.
8, You will get limited edited photos as complimentary. After that, every photo will be charged RS 100 per photo.  
9. The client is to name one contact person who will confirm every step of the project. This is to avoid any contradictory instructions from the client or close relations. so, any suggestions,
instructions and corrections have to come through/with the knowledge of the contact person.
10. The final settlement has to be cleared before shipping if the client chooses to courier the final deliverables.
11. We provide complimentary items such as Calendars, Photo frames, candid albums, etc. However, the client cannot suggest or choose any of the items.
Since these are complimentary items, the editor will choose according to his will.
12. Drone ( Helicam ) Live video/Printing /Led Screen are services that are not included in the package, and if required at the time of project confirmation should be made & will be charged extra.
Requirements like Live Telecasting and Drone sometimes will face Network issues, connectivity problems, low signal strength, Red zone area,,Etc.., so we do these requirements Only if you are interested.
13. If a client needs to set up live video streaming at the venue, kindly be informed that the cams we use do not support the same, and therefore will have to use a separate camera for the same.
Please make sure that you inform us of the requirements at the time of confirmation, and the service charges will apply.
14. We will be requiring a power output of not more than 1000W for lighting purposes at the location of the event.
15. If the client is going to select entire pictures then the point to be noted is for 100 pages of the album the number of pictures required to be sorted is around 300 from a total 5000 to 20000 pictures per day shoot.
16. Data will be kept only for 1 month after the Delivery, so please collect it on your hard drive as soon as possible
17. For Full video and highlights if the client has any specific song/track selection the client has to provide the link of the song and should confirm the same after the selection of the package.
and if the client does not have any selection regarding the song and track then your video editor’s selection is taken for the same and any changes further in that will be chargeable.
18. The song in the full video or highlights is not recommended or suggested by the client due to no selection regarding the same, if used by our video editor and is not relevant to the video then it will be our correction and not payable.
19. This quote is valid only if you confirm the dates before 30 days from this mail or if said dates are not booked before you.
20. In the event of cancellation of any function by the client, the agreed package price shall remain unchanged and no reduction will be applicable. Exceptions will only be considered in cases arising due to issues from our side .
21.  We do not have any hidden charges.


THANKYOU!`;
}

function createInvoicePngBlob() {
  return new Promise((resolve, reject) => {
  const invoice = document.querySelector("#invoicePreview");
  const width = Math.ceil(invoice.scrollWidth);
  const height = Math.ceil(invoice.scrollHeight);
  const scale = 2;
  const clone = invoice.cloneNode(true);
  const wrapper = document.createElement("div");
  const style = document.createElement("style");

  clone.style.width = `${width}px`;
  clone.style.boxShadow = "none";
  clone.style.margin = "0";
  wrapper.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  wrapper.style.width = `${width}px`;
  wrapper.style.height = `${height}px`;
  wrapper.style.background = "white";
  style.textContent = getPageStyles();
  wrapper.append(style, clone);

  const markup = new XMLSerializer().serializeToString(wrapper);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <foreignObject width="100%" height="100%">${markup}</foreignObject>
    </svg>
  `;
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);
  const image = new Image();

  image.onload = () => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = width * scale;
    canvas.height = height * scale;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.scale(scale, scale);
    context.drawImage(image, 0, 0);
    URL.revokeObjectURL(svgUrl);

    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("PNG export failed."));
      }
    }, "image/png");
  };

  image.onerror = () => {
    URL.revokeObjectURL(svgUrl);
    reject(new Error("PNG export failed. Please try opening the app in Chrome or Edge."));
  };

  image.src = svgUrl;
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function downloadInvoicePng() {
  try {
    const blob = await createInvoicePngBlob();
    downloadBlob(blob, getInvoiceFileName());
  } catch (error) {
    alert(error.message);
  }
}

async function copyEmailTemplate() {
  const blob = await createInvoicePngBlob();
  const imageDataUrl = await blobToDataUrl(blob);
  const html = getEmailTemplateHtml(imageDataUrl);
  const text = getEmailTemplateText();

  if (navigator.clipboard && window.ClipboardItem) {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([text], { type: "text/plain" }),
      }),
    ]);
    return true;
  }

  return false;
}

async function openGmailEmail() {
  try {
    const copied = await copyEmailTemplate();
    window.open("https://mail.google.com/mail/?view=cm&fs=1", "_blank", "noopener");
    alert(
      copied
        ? "Email template with the invoice image is copied. Click inside Gmail body and press Ctrl+V."
        : "Gmail opened. Please use Download PNG and paste/insert it at image.png."
    );
  } catch (error) {
    window.open("https://mail.google.com/mail/?view=cm&fs=1", "_blank", "noopener");
    alert("Gmail opened, but the email copy failed. Please use Download PNG and insert it manually.");
  }
}

document.querySelector("#addEvent").addEventListener("click", addEvent);
document.querySelector("#addOutput").addEventListener("click", addCustomOutput);
document.querySelector("#addComplementary").addEventListener("click", addCustomComplementary);
document.querySelector("#printInvoice").addEventListener("click", () => window.print());
document.querySelector("#downloadPng").addEventListener("click", downloadInvoicePng);
document.querySelector("#openGmail").addEventListener("click", openGmailEmail);

[
  elements.clientName,
  elements.totalAmount,
  elements.albumCount,
  elements.albumPageCount,
  elements.albumLeafCount,
  elements.includeTravel,
  elements.includeFood,
  elements.includeAccommodation,
].forEach((input) => {
  input.addEventListener("input", renderPreview);
  input.addEventListener("change", renderPreview);
});

elements.customOutputText.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addCustomOutput();
  }
});

elements.customComplementaryText.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addCustomComplementary();
  }
});

renderEventsForm();
renderOutputsForm();
renderComplementaryForm();
renderPreview();
