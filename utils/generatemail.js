const PDFDocument = require("pdfkit");
const fs = require("fs");

const generateInvoice = (appointment, services) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    doc.fontSize(20).text("Booking Invoice", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Customer Name: ${appointment.customerName}`);
    doc.text(`Phone: ${appointment.customerPhone}`);
    doc.text(`Email: ${appointment.customerEmail}`);
    doc.text(`Appointment Date: ${appointment.appointmentDate}`);
    doc.text(`Time: ${appointment.appointmentTime}`);
    doc.moveDown();

    doc.text("Services:");
    services.forEach((svc) => {
      doc.text(`- ${svc.name}: ${svc.price} kr`);
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total: ${appointment.totalPrice} kr`, { align: "right" });

    doc.end();
  });
};

module.exports = generateInvoice;
