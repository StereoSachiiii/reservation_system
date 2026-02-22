# 🎫 Automated Entry Pass System

The **Automated Entry Pass System** handles the end-to-end lifecycle of a vendor's entry pass, from generation to secure delivery via email.

## 🛠 Technical Workflow

### 1. QR Code Generation
The system uses the `ZXing` (Zebra Crossing) library to generate high-performance QR codes.
- **Service**: `QrService.java`
- **Output**: A PNG byte array.
- **Content**: The QR code typically contains the unique ID of the reservation or a comma-separated list of IDs for multi-stall bookings.

### 2. Secure Pass Downloads (JWT)
Entry passes are sensitive. To allow vendors to download their passes without logging in directly to the complex admin portal, the system uses **Short-Lived JWT Tokens**.
- **Implementation**: `EmailService.java`
- **Process**:
    1. A token is generated from the vendor's username using `JwtUtils`.
    2. The token is appended to a download URL: `/api/v1/vendor/reservations/{id}/qr/download?token={JWT}`.
    3. The backend validates the token before serving the file.

### 3. Email Delivery & In-Line Embedding
The system ensures that the QR code is visible immediately in the vendor's email client, even without an active internet connection (CID embedding).
- **Service**: `EmailService.java`
- **Template**: Thymeleaf-based HTML.
- **Technique**: The QR code PNG is attached to the email as a "CID" (Content-ID).
    ```html
    <img src="cid:qrCode" />
    ```
- **Benefit**: This avoids "External image blocking" in clients like Outlook or Gmail, ensuring the vendor always has their QR code ready.

## 🔍 Deep Code Analysis

### QR Service Generation Logic
```java
// QrService.java L20-21: Initializing the ZXing writer and encoding the bit matrix
QRCodeWriter writer = new QRCodeWriter();
BitMatrix matrix = writer.encode(content, BarcodeFormat.QR_CODE, 200, 200);

// L22-24: Converting the matrix into a byte array formatted as a PNG image
ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
MatrixToImageWriter.writeToStream(matrix, "PNG", outputStream);
return outputStream.toByteArray();
```

### Email Secure Link & CID Logic
```java
// EmailService.java L43-46: Generating a secure download link using JWT
// This enables 'Magic Link' style access without requiring a full login session.
String token = jwtUtils.generateJwtTokenFromUsername(reservations.get(0).getUser().getUsername());
downloadUrl = backendUrl + "/api/v1/vendor/reservations/" + reservations.get(0).getId() + "/qr/download?token=" + token;

// L50-57: Processing the Thymeleaf template and gathering QR content
String html = templateEngine.process("res_confirmation_email_template.html", context);
String qrData = reservations.stream().map(res -> res.getQrCode()).collect(Collectors.joining(","));

// L71-72: Generating the QR and attaching it as an in-line image (CID)
// The ID "qrCode" matches the <img src="cid:qrCode"> tag in the HTML template.
byte[] qrBytes = qrService.generateQrCode(qrData);
mimeMessageHelper.addInline("qrCode", new ByteArrayDataSource(qrBytes, "image/png"));
```

## 🛠 Key Files
- [QrService.java](file:///c:/Users/User/SA_PROJECT/backend/src/main/java/com/bookfair/service/QrService.java) - QR generation logic.
- [EmailService.java](file:///c:/Users/User/SA_PROJECT/backend/src/main/java/com/bookfair/service/EmailService.java) - Orchestration of token generation and email sending.
- [JwtUtils.java](file:///c:/Users/User/SA_PROJECT/backend/src/main/java/com/bookfair/security/JwtUtils.java) - Security utilities.

---
*Created by Antigravity Technical Analysis*
