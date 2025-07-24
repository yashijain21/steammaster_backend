const PDFDocument = require("pdfkit");
const path = require("path");

const generateInvoice = (appointment, services) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // Colors
    const green = "#8DC63F";
    const lightGray = "#F4F4F4";
    const darkGray = "#eeeeee";

    // === Logo ===
    const logoPath = path.join(__dirname, "../logo.png"); // Make sure the logo exists at this path
    try {
      doc.image(logoPath, 40, 40, { width: 60 });
    } catch (err) {
      console.log("Logo not found:", err.message);
    }

    // === Company Info ===
    doc
      .fillColor("black")
      .fontSize(14)
      .text("SteamMaster", 110, 40)
      .fontSize(9)
      .text("Address: Bleckvarugatan 3, 417 07 Göteborg, Sweden", 110, 58)
      .text("Phone: +46 76 556 67 75", 110, 72);

    // === Terms & Conditions ===
    doc
      .fillColor(green)
      .fontSize(12)
      .text("Term & Conditions:", 400, 40)
      .fillColor("black")
      .fontSize(8)
      .text("Lorem ipsum dolor sit amet,", 400, 60)
      .text("consectetuer adipiscing elit.", 400, 72)
      .text("Sed diam nonummy", 400, 84);

    // === Invoice & Balance ===
    doc
      .fillColor("black")
      .fontSize(10)
      .text("INVOICE", 40, 110)
      .text(`Account No:  ${appointment.accountNo}`, 40, 125)
      .text(`Invoice No:  ${appointment.invoiceNo}`, 40, 140)
      .text(`Invoice Date: ${appointment.appointmentDate}`, 40, 155);

    doc
      .text("BALANCE", 400, 110)
      .text(`Total:  ${appointment.totalPrice} kr`, 400, 125)
      .text(`Paid:   0 kr`, 400, 140)
      .text(`Due:    ${appointment.totalPrice} kr`, 400, 155);

    // === Table Header ===
    let startY = 190;
    doc
      .fillColor("white")
      .rect(40, startY, 520, 20)
      .fill(green)
      .fillColor("white")
      .fontSize(10)
      .text("SL", 45, startY + 5)
      .text("Item Description", 80, startY + 5)
      .text("Price", 300, startY + 5)
      .text("Qty.", 380, startY + 5)
      .text("Total", 460, startY + 5);

    // === Table Content ===
    let currentY = startY + 25;
    services.forEach((svc, i) => {
      const bgColor = i % 2 === 0 ? lightGray : darkGray;
      doc.fillColor("black").rect(40, currentY, 520, 20).fill(bgColor).fillColor("black");

      doc
        .fontSize(9)
        .text(`${i + 1}`, 45, currentY + 5)
        .text(`${svc.name}`, 80, currentY + 5)
        .text(`${svc.price.toFixed(2)} kr`, 300, currentY + 5)
        .text(`1`, 385, currentY + 5)
        .text(`${svc.price.toFixed(2)} kr`, 460, currentY + 5);

      currentY += 20;
    });

    // === Totals ===
    const subtotal = services.reduce((acc, s) => acc + s.price, 0);
    const tax = 10;
    const total = subtotal + tax;

    doc
      .fillColor("black")
      .fontSize(10)
      .text(`Subtotal:`, 400, currentY + 10)
      .text(`${subtotal.toFixed(2)} kr`, 480, currentY + 10)
      .text(`Tax Rate:`, 400, currentY + 25)
      .text(`${tax.toFixed(2)} kr`, 480, currentY + 25)
      .fillColor(green)
      .fontSize(12)
      .text(`TOTAL`, 400, currentY + 45)
      .text(`${total.toFixed(2)} kr`, 480, currentY + 45);

    // === Payment Info ===
    doc
      .fillColor(green)
      .fontSize(10)
      .text("Payment Info:", 40, currentY + 80)
      .fillColor("black")
      .fontSize(9)
      .text(`Account No: ${appointment.accountNo}`, 40, currentY + 95)
      .text(`Name: ${appointment.customerName}`, 40, currentY + 110)
      .text(`Bank Detail: 0123 456 789`, 40, currentY + 125);

    // === Signature ===
    doc
      .fillColor(green)
      .fontSize(12)
      .text("John Smeeth", 400, currentY + 110)
      .fillColor("black")
      .fontSize(9)
      .text("Manager", 400, currentY + 125);

    // === Footer ===
    doc
      .fontSize(8)
      .fillColor("black")
      .text("THANK YOU", 40, currentY + 160)
      .fontSize(7)
      .text(
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. It has survived not only five centuries.",
        40,
        currentY + 175,
        { width: 520 }
      );

    doc.end();
  });
};

module.exports = generateInvoice;
