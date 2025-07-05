const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

async function generateCertificatePdf({ studentName, courseTitle, outputPath, completionDate, courseHours, instructorName }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);

    // Page dimensions (A4 landscape: 842x595)
    const pageWidth = doc.page.width;  // 842
    const pageHeight = doc.page.height; // 595
    const margin = 35;

    // Professional gradient background
    const gradient = doc.linearGradient(0, 0, pageWidth, pageHeight);
    gradient.stop(0, '#fafbfc').stop(0.3, '#ffffff').stop(0.7, '#ffffff').stop(1, '#f8f9fa');
    doc.rect(0, 0, pageWidth, pageHeight).fill(gradient);

    // Outer border
    doc.lineWidth(6)
       .strokeColor('#1a365d')
       .rect(margin - 5, margin - 5, pageWidth - 2 * (margin - 5), pageHeight - 2 * (margin - 5))
       .stroke();

    // Inner decorative border
    doc.lineWidth(2)
       .strokeColor('#d4af37')
       .rect(margin + 5, margin + 5, pageWidth - 2 * (margin + 5), pageHeight - 2 * (margin + 5))
       .stroke();

    // Enhanced corner decorations
    drawEnhancedCornerDecorations(doc, pageWidth, pageHeight, margin);

    // Header section - Logo and Platform info
    const headerY = margin + 20;
    
    // Logo
    try {
      doc.image(path.join(__dirname, '../public/logo.png'), margin + 20, headerY - 5, { width: 50 });
    } catch (e) {
      // Fallback logo
      doc.circle(margin + 45, headerY + 15, 20)
         .fillColor('#1a365d')
         .fill();
      doc.fontSize(12)
         .fillColor('#ffffff')
         .text('EQ', margin + 39, headerY + 10);
    }

    // Platform information
    doc.fontSize(11)
       .fillColor('#1a365d')
       .text('EduQuest Academy', pageWidth - margin - 160, headerY, { width: 140, align: 'right' });
    
    doc.fontSize(8)
       .fillColor('#718096')
       .text('Professional Learning Platform', pageWidth - margin - 160, headerY + 18, { width: 140, align: 'right' });

    // Main title
    const titleY = headerY + 65;
    doc.fontSize(36)
       .fillColor('#1a365d')
       .text('Certificate of Completion', 0, titleY, { align: 'center' });

    // Decorative underline
    doc.moveTo(pageWidth/2 - 140, titleY + 50)
       .lineTo(pageWidth/2 + 140, titleY + 50)
       .lineWidth(3)
       .strokeColor('#d4af37')
       .stroke();

    // Decorative elements
    doc.circle(pageWidth/2 - 150, titleY + 50, 3).fillColor('#d4af37').fill();
    doc.circle(pageWidth/2 + 150, titleY + 50, 3).fillColor('#d4af37').fill();

    // Certification text
    const certTextY = titleY + 80;
    doc.fontSize(16)
       .fillColor('#2d3748')
       .text('This certifies that', 0, certTextY, { align: 'center' });

    // Student name with elegant background
    const nameY = certTextY + 35;
    const nameWidth = Math.min(Math.max(320, studentName.length * 12), pageWidth - 2 * margin - 60);
    doc.roundedRect(pageWidth/2 - nameWidth/2, nameY - 10, nameWidth, 50, 10)
       .fillColor('#f7fafc')
       .fill()
       .strokeColor('#cbd5e0')
       .lineWidth(1)
       .stroke();
    
    doc.fontSize(30)
       .fillColor('#1a365d')
       .text(studentName, 0, nameY + 5, { align: 'center' });

    // Achievement text
    const achievementY = nameY + 70;
    doc.fontSize(16)
       .fillColor('#2d3748')
       .text('has successfully completed the comprehensive training program', 0, achievementY, { align: 'center' });

    // Course title with elegant design
    const courseY = achievementY + 35;
    const courseWidth = Math.min(Math.max(400, courseTitle.length * 11), pageWidth - 2 * margin - 60);
    doc.roundedRect(pageWidth/2 - courseWidth/2, courseY - 10, courseWidth, 50, 10)
       .fillColor('#edf2f7')
       .fill()
       .strokeColor('#0d6efd')
       .lineWidth(2)
       .stroke();
    
    doc.fontSize(24)
       .fillColor('#0d6efd')
       .text(courseTitle, 0, courseY + 5, { align: 'center' });

    // Information section layout
    const infoY = courseY + 80;
    const leftInfoX = margin + 50;
    const rightInfoX = pageWidth - margin - 200;

    // Left column - Course details
    doc.fontSize(12)
       .fillColor('#1a365d')
       .text('Course Details', leftInfoX, infoY);
    
    doc.fontSize(10)
       .fillColor('#4a5568')
       .text(`Completion Date: ${completionDate || new Date().toLocaleDateString('en-US', { 
         year: 'numeric', 
         month: 'long', 
         day: 'numeric' 
       })}`, leftInfoX, infoY + 20);

    if (courseHours) {
      doc.text(`Training Hours: ${courseHours} hours`, leftInfoX, infoY + 35);
    }

    if (instructorName) {
      doc.text(`Lead Instructor: ${instructorName}`, leftInfoX, infoY + 50);
    }

    // Right section - Seal and signature
    const sealX = pageWidth - margin - 100;
    const sealY = infoY + 30;
    
    // Official seal with multiple rings
    doc.circle(sealX, sealY, 40)
       .lineWidth(3)
       .strokeColor('#d4af37')
       .stroke();
    
    doc.circle(sealX, sealY, 30)
       .lineWidth(2)
       .strokeColor('#d4af37')
       .stroke();

    // Seal text
    doc.fontSize(11)
       .fillColor('#d4af37')
       .text('EduQuest', sealX - 22, sealY - 12);
    
    doc.fontSize(8)
       .text('Academy', sealX - 18, sealY + 2);
    
    doc.fontSize(7)
       .text('Est. 2020', sealX - 15, sealY + 12);

    // Signature line
    const signatureY = sealY + 60;
    doc.moveTo(sealX - 70, signatureY)
       .lineTo(sealX + 70, signatureY)
       .lineWidth(1)
       .strokeColor('#4a5568')
       .stroke();
    
    doc.fontSize(10)
       .fillColor('#1a365d')
       .text('Academic Director', sealX - 35, signatureY + 10);

    // Certificate verification info
    const certNumber = `EQ-${Date.now().toString().slice(-6)}`;
    doc.fontSize(8)
       .fillColor('#718096')
       .text(`Certificate ID: ${certNumber}`, leftInfoX, infoY + 70);

    doc.fontSize(8)
       .fillColor('#0d6efd')
       .text('Verify at: www.eduquest.com/verify', leftInfoX, infoY + 85);

    // Footer
    const footerY = pageHeight - margin - 15;
    doc.fontSize(8)
       .fillColor('#a0aec0')
       .text('© 2025 EduQuest Academy - Empowering Excellence Through Education', 0, footerY, { align: 'center' });

    doc.end();

    stream.on('finish', () => resolve());
    stream.on('error', reject);
  });
}

// Enhanced corner decorations function
function drawEnhancedCornerDecorations(doc, pageWidth, pageHeight, margin) {
  const decorSize = 20;
  
  // Top-left corner
  doc.save();
  doc.translate(margin + 10, margin + 10);
  drawEnhancedCornerPattern(doc, decorSize);
  doc.restore();
  
  // Top-right corner
  doc.save();
  doc.translate(pageWidth - margin - 10, margin + 10);
  doc.rotate(90);
  drawEnhancedCornerPattern(doc, decorSize);
  doc.restore();
  
  // Bottom-right corner
  doc.save();
  doc.translate(pageWidth - margin - 10, pageHeight - margin - 10);
  doc.rotate(180);
  drawEnhancedCornerPattern(doc, decorSize);
  doc.restore();
  
  // Bottom-left corner
  doc.save();
  doc.translate(margin + 10, pageHeight - margin - 10);
  doc.rotate(270);
  drawEnhancedCornerPattern(doc, decorSize);
  doc.restore();
}

// Enhanced corner pattern function
function drawEnhancedCornerPattern(doc, size) {
  doc.lineWidth(1.5)
     .strokeColor('#d4af37');
  
  // Main corner lines
  doc.moveTo(0, 0)
     .lineTo(size, 0)
     .lineTo(size, 3)
     .lineTo(3, 3)
     .lineTo(3, size)
     .lineTo(0, size)
     .stroke();
  
  // Inner decorative lines
  doc.lineWidth(1)
     .moveTo(6, 6)
     .lineTo(size - 3, 6)
     .lineTo(size - 3, 9)
     .lineTo(9, 9)
     .lineTo(9, size - 3)
     .lineTo(6, size - 3)
     .stroke();
}

module.exports = generateCertificatePdf;