// ============================================================
// PHARMACY LOGIN + SECURITY-CODE REDIRECTS
// ============================================================
//
// IMPORTANT:
// This is an HTML/JavaScript-only demo. Base64 only hides values from
// casual viewing; it does NOT provide real security.
// Move authentication to Spring Boot for real protection.
//

const _d = (value) => atob(value);

// Normal pharmacy login
const LOGIN_USERNAME = _d("dmlrYXNo");   // vikash
const LOGIN_PASSWORD = _d("QDEyMw==");   // @123
const ACCESS_CODE    = _d("Nzg2");       // 786

// Special security codes.
// These are checked BEFORE the normal 786 pharmacy login.
const REDIRECT_CODES = new Map([
  [_d("Nzg3"), "https://www.facebook.com/"],   // 787
  [_d("Nzg1"), "https://www.youtube.com/"],    // 785
  [_d("Nzg0"), "https://www.google.com/"],     // 784
  [_d("Nzgz"), "https://www.wikipedia.org/"],  // 783
  [_d("Nzgy"), "https://busdriver.wtf/"]       // 782
]);

function showApp() {
  document.getElementById("loginView").classList.add("hidden");
  document.getElementById("appView").classList.remove("hidden");
}

function showLogin() {
  document.getElementById("appView").classList.add("hidden");
  document.getElementById("loginView").classList.remove("hidden");
}

if (sessionStorage.getItem("pharmacyLoggedIn") === "yes") {
  showApp();
}

document.getElementById("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const username = document.getElementById("loginUser").value.trim();
  const password = document.getElementById("loginPass").value;
  const code = document.getElementById("loginCode").value.trim();
  const error = document.getElementById("loginError");

  error.textContent = "";

  // Special redirect code
  const redirectUrl = REDIRECT_CODES.get(code);

  if (redirectUrl) {
    window.location.href = redirectUrl;
    return;
  }

  // Normal pharmacy access code
  if (code !== ACCESS_CODE) {
    error.textContent = "Invalid security code.";
    return;
  }

  // Username + password required only for the normal pharmacy login.
  if (username === LOGIN_USERNAME && password === LOGIN_PASSWORD) {
    sessionStorage.setItem("pharmacyLoggedIn", "yes");
    showApp();
    return;
  }

  error.textContent = "Invalid username or password.";
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  sessionStorage.removeItem("pharmacyLoggedIn");
  document.getElementById("loginForm").reset();
  document.getElementById("loginError").textContent = "";
  showLogin();
});


// ============================================================
// PHARMACY BILLING
// ============================================================

const sampleItems = [
  {name:"IV CANNULA 22G", hsn:"300490", manf:"NOT S", sh:"", batch:"4077726E", exp:"Apr-31", qty:1, rate:193.33, mrp:203.00, disc:1.55, gst:5},
  {name:"FIXER", hsn:"30059040", manf:"NOT S", sh:"", batch:"C22", exp:"Apr-29", qty:1, rate:76.19, mrp:80.00, disc:0.61, gst:5},
  {name:"PANTOGASTIK IV INJ", hsn:"300490", manf:"NO MA", sh:"", batch:"33", exp:"Jun-27", qty:1, rate:50.45, mrp:52.97, disc:0.40, gst:5},
  {name:"ONDAFINE-4MG INJ", hsn:"30049099", manf:"NO MA", sh:"", batch:"ONE26001", exp:"Jan-28", qty:1, rate:12.11, mrp:12.72, disc:0.10, gst:5},
  {name:"SYRINGE 5ML", hsn:"300490", manf:"NOT S", sh:"", batch:"5MLG01", exp:"Jun-27", qty:3, rate:11.43, mrp:12.00, disc:0.27, gst:5},
  {name:"OPTINEURON FORT INJ", hsn:"30049099", manf:"LUPIN", sh:"H", batch:"11819", exp:"Feb-28", qty:1, rate:17.14, mrp:18.00, disc:0.14, gst:5},
  {name:"IV SET", hsn:"300490", manf:"NOT S", sh:"", batch:"4027726B", exp:"Jan-31", qty:1, rate:190.48, mrp:200.00, disc:1.52, gst:5},
  {name:"EXAMINATION GLOVES", hsn:"40151100", manf:"NOT S", sh:"", batch:"EXAS01", exp:"Jul-29", qty:2, rate:10.48, mrp:11.00, disc:0.17, gst:5}
];

let items = structuredClone(sampleItems);

function money(number) {
  return Number(number || 0).toFixed(2);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#039;"
  })[character]);
}

function localDateTimeValue(date = new Date()) {
  const localDate = new Date(date);
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  return localDate.toISOString().slice(0, 16);
}

function setDefaultDate() {
  document.getElementById("billDate").value = localDateTimeValue();
  document.getElementById("printDate").value = localDateTimeValue();
}

function rowInput(index, key, value, type = "text", className = "") {
  const numericAttributes =
    type === "number" ? 'step="0.01" min="0"' : "";

  return `
    <input
      class="${className}"
      type="${type}"
      data-index="${index}"
      data-key="${key}"
      value="${escapeHtml(value)}"
      ${numericAttributes}
    >
  `;
}

function renderEntry() {
  const body = document.getElementById("entryBody");

  body.innerHTML = items.map((item, index) => `
    <tr>
      <td>${rowInput(index,"name",item.name,"text","name")}</td>
      <td>${rowInput(index,"hsn",item.hsn)}</td>
      <td>${rowInput(index,"manf",item.manf)}</td>
      <td>${rowInput(index,"sh",item.sh)}</td>
      <td>${rowInput(index,"batch",item.batch)}</td>
      <td>${rowInput(index,"exp",item.exp)}</td>
      <td>${rowInput(index,"qty",item.qty,"number")}</td>
      <td>${rowInput(index,"rate",item.rate,"number")}</td>
      <td>${rowInput(index,"mrp",item.mrp,"number")}</td>
      <td>${rowInput(index,"disc",item.disc,"number")}</td>
      <td>${rowInput(index,"gst",item.gst,"number")}</td>
      <td>
        <button class="danger" data-delete="${index}" type="button">×</button>
      </td>
    </tr>
  `).join("");

  body.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", (event) => {
      const index = Number(event.target.dataset.index);
      const key = event.target.dataset.key;
      const numeric = ["qty","rate","mrp","disc","gst"].includes(key);

      items[index][key] = numeric
        ? Number(event.target.value || 0)
        : event.target.value;

      renderReceipt();
    });
  });

  body.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      items.splice(Number(button.dataset.delete), 1);
      renderEntry();
      renderReceipt();
    });
  });
}

function calculateItem(item) {
  const qty = Number(item.qty || 0);
  const rate = Number(item.rate || 0);
  const discount = Number(item.disc || 0);
  const gst = Number(item.gst || 0);

  const gross = qty * rate;
  const taxable = Math.max(0, gross - discount);

  const cgstPct = gst / 2;
  const sgstPct = gst / 2;

  const cgst = taxable * cgstPct / 100;
  const sgst = taxable * sgstPct / 100;

  const bill = taxable + cgst + sgst;

  return {
    gross,
    taxable,
    cgstPct,
    sgstPct,
    cgst,
    sgst,
    bill
  };
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  let hour = date.getHours();
  const meridiem = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;

  return `${String(date.getDate()).padStart(2,"0")}-${months[date.getMonth()]}-${date.getFullYear()} ${String(hour).padStart(2,"0")}:${String(date.getMinutes()).padStart(2,"0")} ${meridiem}`;
}

function numberToWords(number) {
  number = Math.round(number);

  if (number === 0) return "Zero";

  const ones = [
    "","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
    "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen",
    "Sixteen","Seventeen","Eighteen","Nineteen"
  ];

  const tens = [
    "","","Twenty","Thirty","Forty",
    "Fifty","Sixty","Seventy","Eighty","Ninety"
  ];

  const under1000 = (value) => {
    let output = "";

    if (value >= 100) {
      output += ones[Math.floor(value / 100)] + " Hundred ";
      value %= 100;
    }

    if (value >= 20) {
      output += tens[Math.floor(value / 10)] + " ";
      value %= 10;
    }

    if (value > 0) {
      output += ones[value] + " ";
    }

    return output.trim();
  };

  let output = "";

  if (number >= 10000000) {
    output += under1000(Math.floor(number / 10000000)) + " Crore ";
    number %= 10000000;
  }

  if (number >= 100000) {
    output += under1000(Math.floor(number / 100000)) + " Lakh ";
    number %= 100000;
  }

  if (number >= 1000) {
    output += under1000(Math.floor(number / 1000)) + " Thousand ";
    number %= 1000;
  }

  if (number > 0) {
    output += under1000(number);
  }

  return output.trim();
}

function renderReceipt() {
  const receiptBody = document.getElementById("receiptBody");

  receiptBody.innerHTML = items.map((item, index) => {
    const calculated = calculateItem(item);

    return `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.hsn)}</td>
        <td>${escapeHtml(item.manf)}</td>
        <td>${escapeHtml(item.sh)}</td>
        <td>${escapeHtml(item.batch)}</td>
        <td>${escapeHtml(item.exp)}</td>
        <td>${money(item.qty)}</td>
        <td>${money(item.rate)}</td>
        <td>${money(item.mrp)}</td>
        <td>${money(item.disc)}</td>
        <td>${money(calculated.taxable)}</td>
        <td>${money(calculated.cgstPct)}</td>
        <td>${money(calculated.cgst)}</td>
        <td>${money(calculated.sgstPct)}</td>
        <td>${money(calculated.sgst)}</td>
        <td>${money(calculated.bill)}</td>
      </tr>
    `;
  }).join("");

  let taxable = 0;
  let cgst = 0;
  let sgst = 0;
  let billTotal = 0;
  let weightedGst = 0;

  items.forEach((item) => {
    const calculated = calculateItem(item);

    taxable += calculated.taxable;
    cgst += calculated.cgst;
    sgst += calculated.sgst;
    billTotal += calculated.bill;

    weightedGst += calculated.taxable * Number(item.gst || 0);
  });

  const concession =
    Number(document.getElementById("concession").value || 0);

  const afterConcession =
    Math.max(0, billTotal - concession);

  const net = Math.round(afterConcession);
  const roundoff = net - afterConcession;

  const averageGst =
    taxable ? weightedGst / taxable : 0;

  document.getElementById("rBillNo").textContent =
    document.getElementById("billNo").value;

  document.getElementById("rBillDate").textContent =
    formatDate(document.getElementById("billDate").value);

  document.getElementById("rPatient").textContent =
    document.getElementById("patientName").value;

  document.getElementById("rDoctor").textContent =
    document.getElementById("doctorName").value;

  document.getElementById("rCreatedBy").textContent =
    document.getElementById("createdBy").value;

  document.getElementById("rPrintBy").textContent =
    document.getElementById("printBy").value;

  document.getElementById("rCreateDate").textContent =
    formatDate(document.getElementById("billDate").value);

  document.getElementById("rPrintDate").textContent =
    formatDate(document.getElementById("printDate").value);

  const topPrintDate = document.getElementById("rPrintTop");
  if (topPrintDate) {
    topPrintDate.textContent =
      formatDate(document.getElementById("printDate").value);
  }

  document.getElementById("rPayMode").textContent =
    document.getElementById("payMode").value;

  document.getElementById("rPayAmount").textContent =
    money(net);

  document.getElementById("sumTaxable").textContent =
    "₹" + money(taxable);

  document.getElementById("sumCgst").textContent =
    "₹" + money(cgst);

  document.getElementById("sumSgst").textContent =
    "₹" + money(sgst);

  document.getElementById("sumNet").textContent =
    "₹" + money(net);

  document.getElementById("gTaxable").textContent =
    money(taxable);

  document.getElementById("gCgstPct").textContent =
    money(averageGst / 2);

  document.getElementById("gCgstAmt").textContent =
    money(cgst);

  document.getElementById("gSgstPct").textContent =
    money(averageGst / 2);

  document.getElementById("gSgstAmt").textContent =
    money(sgst);

  document.getElementById("gTotal").textContent =
    money(billTotal);

  const gTaxableTotal = document.getElementById("gTaxableTotal");
  const gCgstTotal = document.getElementById("gCgstTotal");
  const gSgstTotal = document.getElementById("gSgstTotal");
  const gBillTotal = document.getElementById("gBillTotal");
  const gGrandTotal = document.getElementById("gGrandTotal");

  if (gTaxableTotal) gTaxableTotal.textContent = money(taxable);
  if (gCgstTotal) gCgstTotal.textContent = money(cgst);
  if (gSgstTotal) gSgstTotal.textContent = money(sgst);
  if (gBillTotal) gBillTotal.textContent = money(billTotal);
  if (gGrandTotal) gGrandTotal.textContent = money(billTotal);

  document.getElementById("rRoundoff").textContent =
    money(roundoff);

  document.getElementById("rConcession").textContent =
    money(concession);

  document.getElementById("rNet").textContent =
    money(net);

  document.getElementById("rReceipt").textContent =
    money(net);

  document.getElementById("amountWords").innerHTML =
    `Received Sum of <b>${numberToWords(net)} Rupees Only</b> Towards Above Bill`;
}


// ============================================================
// BILLING EVENTS
// ============================================================

document.getElementById("addItemBtn").addEventListener("click", () => {
  items.push({
    name:"",
    hsn:"",
    manf:"",
    sh:"",
    batch:"",
    exp:"",
    qty:1,
    rate:0,
    mrp:0,
    disc:0,
    gst:5
  });

  renderEntry();
  renderReceipt();
});

document.getElementById("printBtn").addEventListener("click", () => {
  document.getElementById("printDate").value = localDateTimeValue();
  renderReceipt();

  setTimeout(() => {
    window.print();
  }, 50);
});

const newBillButton = document.getElementById("newBillBtn");

if (newBillButton) {
  newBillButton.addEventListener("click", () => {
    if (!confirm("Start a new bill? Current unsaved data will be cleared.")) {
      return;
    }

    items = [];

    document.getElementById("billNo").value =
      "CPOPB" + String(Date.now()).slice(-10);

    document.getElementById("patientName").value = "";
    document.getElementById("doctorName").value = "";
    document.getElementById("concession").value = "0";

    setDefaultDate();
    renderEntry();
    renderReceipt();
  });
}

[
  "billNo",
  "billDate",
  "printDate",
  "patientName",
  "doctorName",
  "createdBy",
  "printBy",
  "payMode",
  "concession"
].forEach((id) => {
  const element = document.getElementById(id);

  element.addEventListener("input", renderReceipt);
  element.addEventListener("change", renderReceipt);
});

setDefaultDate();
renderEntry();
renderReceipt();
