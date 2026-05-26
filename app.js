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
  emailStatus: document.querySelector("#emailStatus"),
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

function setEmailStatus(message, type = "info") {
  elements.emailStatus.hidden = false;
  elements.emailStatus.textContent = message;
  elements.emailStatus.classList.toggle("is-success", type === "success");
  elements.emailStatus.classList.toggle("is-error", type === "error");
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

function getListTextItems(selector) {
  return Array.from(document.querySelectorAll(`${selector} li`)).map((item) => item.textContent.trim());
}

function getWrappedLines(context, text, maxWidth) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";

  words.forEach((word) => {
    const nextLine = line ? `${line} ${word}` : word;
    if (context.measureText(nextLine).width <= maxWidth) {
      line = nextLine;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  });

  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function drawWrappedText(context, text, x, y, maxWidth, lineHeight, align = "left") {
  const lines = getWrappedLines(context, text, maxWidth);
  context.textAlign = align;

  lines.forEach((line, index) => {
    context.fillText(line, x, y + index * lineHeight);
  });

  return lines.length * lineHeight;
}

function drawBullets(context, items, x, y, maxWidth) {
  let cursorY = y;
  context.font = "14px Times New Roman";
  context.fillStyle = "#111";
  context.textAlign = "left";

  items.forEach((item) => {
    context.fillText("•", x, cursorY);
    const usedHeight = drawWrappedText(context, item, x + 12, cursorY, maxWidth - 12, 17);
    cursorY += Math.max(17, usedHeight) + 3;
  });

  return cursorY;
}

function canvasToPngBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("PNG export failed."));
      }
    }, "image/png");
  });
}

async function createInvoicePngBlob() {
  renderPreview();

  const width = 720;
  const scale = 2;
  const columns = [150, 170, 210, 190];
  const outputs = getListTextItems("#previewOutputs");
  const complementary = getListTextItems("#previewComplementary");
  const measureCanvas = document.createElement("canvas");
  const measureContext = measureCanvas.getContext("2d");
  measureContext.font = "16px Times New Roman";

  const eventRows = state.events.map((event) => {
    const cameraLines = [];
    if (event.photos > 0) cameraLines.push(pluralize(event.photos, "photographer", "photographers"));
    if (event.videos > 0) cameraLines.push(pluralize(event.videos, "videographer", "videographers"));

    const cells = [
      event.date.trim() || "No date",
      event.name.trim() || "Event",
      cameraLines.join("\n"),
      event.location.trim(),
    ];
    const lineCounts = cells.map((cell, index) => {
      return String(cell)
        .split("\n")
        .flatMap((line) => getWrappedLines(measureContext, line, columns[index] - 24)).length;
    });

    return {
      cells,
      height: Math.max(86, Math.max(...lineCounts) * 19 + 26),
    };
  });

  const listHeight = Math.max(220, Math.max(outputs.length, complementary.length) * 24 + 105);
  const height = 31 + 38 + eventRows.reduce((sum, row) => sum + row.height, 0) + listHeight + 44 + 1;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = width * scale;
  canvas.height = height * scale;
  context.scale(scale, scale);
  context.fillStyle = "#fffdf8";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "#111";
  context.lineWidth = 1;
  context.fillStyle = "#111";

  context.strokeRect(0.5, 0.5, width - 1, height - 1);
  context.font = "bold 18px Times New Roman";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(`Client Name : ${elements.previewClientName.textContent}`, width / 2, 15.5);
  context.beginPath();
  context.moveTo(0, 31.5);
  context.lineTo(width, 31.5);
  context.stroke();

  let y = 31;
  context.font = "bold 16px Times New Roman";
  const headers = ["Date", "Event", "Camera", "Location"];
  let x = 0;
  headers.forEach((header, index) => {
    context.strokeRect(x + 0.5, y + 0.5, columns[index], 38);
    context.fillText(header, x + columns[index] / 2, y + 19);
    x += columns[index];
  });
  y += 38;

  context.font = "16px Times New Roman";
  eventRows.forEach((row) => {
    x = 0;
    row.cells.forEach((cell, index) => {
      context.strokeRect(x + 0.5, y + 0.5, columns[index], row.height);
      const lines = String(cell)
        .split("\n")
        .flatMap((line) => getWrappedLines(context, line, columns[index] - 24));
      const startY = y + row.height / 2 - ((lines.length - 1) * 19) / 2;
      context.textAlign = "center";
      lines.forEach((line, lineIndex) => {
        context.fillText(line, x + columns[index] / 2, startY + lineIndex * 19);
      });
      x += columns[index];
    });
    y += row.height;
  });

  context.strokeRect(0.5, y + 0.5, width / 2, listHeight);
  context.strokeRect(width / 2 + 0.5, y + 0.5, width / 2 - 1, listHeight);
  context.font = "bold 18px Times New Roman";
  context.textAlign = "left";
  context.fillText("Outputs", 18, y + 45);
  context.fillText("Complementary Items", width / 2 + 18, y + 45);
  drawBullets(context, outputs, 24, y + 90, width / 2 - 48);
  drawBullets(context, complementary, width / 2 + 24, y + 90, width / 2 - 48);
  y += listHeight;

  context.strokeRect(0.5, y + 0.5, width - 1, 44);
  context.font = "20px Times New Roman";
  context.textAlign = "center";
  context.fillText(
    `Total Amount: ${elements.previewTotal.textContent} /- INR${elements.previewIncluded.textContent}`,
    width / 2,
    y + 22
  );

  return canvasToPngBlob(canvas);
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

async function copyTextToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
}

async function copyInvoiceImageToClipboard() {
  const copyButton = document.querySelector("#copyInvoiceImage");
  const originalText = copyButton.textContent;
  copyButton.disabled = true;
  copyButton.textContent = "Copying...";
  setEmailStatus("Preparing invoice image...", "info");

  try {
    const blob = await createInvoicePngBlob();
    const canCopyImage =
      window.isSecureContext &&
      navigator.clipboard &&
      window.ClipboardItem &&
      (!ClipboardItem.supports || ClipboardItem.supports("image/png"));

    if (canCopyImage) {
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);
      setEmailStatus("Success: invoice image copied. In Gmail, click the image.png line and press Ctrl+V.", "success");
      copyButton.textContent = "Copied";
      setTimeout(() => {
        copyButton.textContent = originalText;
        copyButton.disabled = false;
      }, 1600);
      return true;
    }

    downloadBlob(blob, getInvoiceFileName());
    setEmailStatus(
      "Image copy is not supported from this page. The PNG was downloaded; insert it manually in Gmail at image.png. For direct copy, open the app on HTTPS or localhost in Chrome/Edge.",
      "error"
    );
    copyButton.textContent = originalText;
    copyButton.disabled = false;
    return false;
  } catch (error) {
    setEmailStatus("Image copy failed. Use Download PNG, then insert the PNG manually in Gmail.", "error");
    copyButton.textContent = originalText;
    copyButton.disabled = false;
    throw error;
  } finally {
    if (copyButton.textContent === "Copying...") {
      copyButton.textContent = originalText;
      copyButton.disabled = false;
    }
  }
}

function getGmailComposeUrl() {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    su: "BOOKING CONFIRMATION FROM AFX FILMER",
    body: getEmailTemplateText(),
  });

  return `https://mail.google.com/mail/?${params.toString()}`;
}

async function openGmailEmail() {
  const gmailUrl = getGmailComposeUrl();

  try {
    await copyTextToClipboard(getEmailTemplateText());
    window.open(gmailUrl, "_blank", "noopener");
    setEmailStatus("Gmail opened with the email body. Then click Copy Invoice Image and paste it at image.png.", "success");
  } catch (error) {
    window.open(gmailUrl, "_blank", "noopener");
    setEmailStatus("Gmail opened with the email body. If Gmail removes it, paste from clipboard or try Chrome.", "error");
  }
}

document.querySelector("#addEvent").addEventListener("click", addEvent);
document.querySelector("#addOutput").addEventListener("click", addCustomOutput);
document.querySelector("#addComplementary").addEventListener("click", addCustomComplementary);
document.querySelector("#printInvoice").addEventListener("click", () => window.print());
document.querySelector("#downloadPng").addEventListener("click", downloadInvoicePng);
document.querySelector("#openGmail").addEventListener("click", openGmailEmail);
document.querySelector("#copyInvoiceImage").addEventListener("click", () => {
  copyInvoiceImageToClipboard().catch(() => {
    const copyButton = document.querySelector("#copyInvoiceImage");
    copyButton.disabled = false;
    copyButton.textContent = "Copy Invoice Image";
    setEmailStatus("Image copy failed. Use Download PNG, then insert the PNG manually in Gmail.", "error");
  });
});

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
