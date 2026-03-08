# Design Specification: Photo Attachments for Job Logs

## 1. Overview
The Photo Attachments feature allows field technicians to capture/upload up to 5 photos per job log, optionally caption them, and submit them alongside the text data. Admins can view these photos in the back office and include them in generated PDF reports.

## 2. Token Definitions

### Colors
- **Brand Green:** `#22c55e` (Primary Actions, Success Data)
- **Dark BG:** `#1a1a2e` (Field Portal Body)
- **Card BG:** `#252542` (Field Form Sections)
- **Border:** `#334155` (Field Dividers)
- **Text Main:** `#ffffff` (Field Text)
- **Text Muted:** `#94a3b8` (Field Placeholders/Secondary)
- **Error Red:** `#ef4444` (Validation/Failed Uploads)
- **Admin BG:** `#f8fafc` (Admin Portal Body)
- **Admin Surface:** `#ffffff` (Admin Cards)

### Spacing & Sizing
- **Mobile padding:** `16px` standard internal padding
- **Touch Targets:** Minimum `44px` height (`88px` for primary capture buttons)
- **Border Radius:** `8px` for standard elements, `12px` for large cards/buttons
- **Mobile Photo Strip:** `140px` width per item, horizontal scroll
- **Admin Photo Grid:** Auto-fill min `200px` columns

## 3. UI Flow Breakdown

### A. Field Input (Mobile First)
- **Location:** Below "Work Performed" on `/field/log`
- **Upload Controls:** Two equal-width giant square buttons side-by-side (Camera, Gallery)
- **Photo Strip:** A horizontal scrolling container (touch swipeable) that appears when >=1 photo is added.
- **Card layout per photo:**
  - Thumbnail (100px height, object-fit cover)
  - `×` Remove button in top right (absolute positioned, round, semi-transparent black bg)
  - Inline text input for optional caption below thumbnail

### B. Field History (Mobile)
- **Location:** `/field/history`
- **Indicator:** A badge on the log card if photos exist (e.g., "4 Photos" with a camera icon)
- **Display:** A small 3-column grid of square thumbnails embedded in the card.
- **Lightbox Overlay:** Tapping any thumbnail opens a full-screen black overlay to swipe through full images and read captions.

### C. Admin View (Desktop)
- **Location:** Job Log details modal/page in `/admin/reports`
- **Display:** A CSS Grid of photo cards below the text details.
- **Card Info:** Contains the thumbnail (4:3 ratio), caption text, and file metadata.
- **Action:** Clicking thumbnail opens a larger view. Includes a "Download All .zip" utility button.

### D. PDF Reports
- **Recommendation:** Implement the "Appendix" style. Small thumbnails inline in the table get messy if there are 5 images. Instead, the table should state "Photos Attached: Yes (See Appendix)", and a new page is appended to the PDF containing a 3-column grid of the photos with their captions.

## 4. Component States

### Photo Upload Item
- **Empty:** Doesn't exist. Add buttons are visible.
- **Uploading:** 
  - Show thumbnail as soon as local blob is generated.
  - Overlay semi-transparent black with a progress bar (`#22c55e`) and "Uploading..." text.
  - Disable remove button during upload.
- **Loaded:** Progress overlay disappears. Caption input becomes editable.
- **Error:** Border turns `#ef4444`. Icon changes to error. Shows "Upload failed" and a "Retry" text link.
- **Max Content:** Hide "Take Photo" and "Gallery" buttons when count reaches 5.

## 5. Accessibility (WCAG 2.1 AA) Notes

- **Keyboard Focus:** Ensure horizontal photo strip items can receive focus via `Tab`, and captions can be edited by keyboard.
- **Aria Labels:** 
  - `aria-label="Remove photo of [caption]"` on the `×` button.
  - `<input aria-label="Photo caption">` for the caption field.
- **Contrast:** The white text on the semi-transparent black background for the `×` button must maintain 4.5:1 contrast against any photo underneath.
- **Announcements:** Screen readers should announce "Photo uploaded successfully" or "Upload failed" using `aria-live="polite"` regions.

## 6. Hand-off Notes for Build (Luke)

- **Storage:** Since this uses serverless Postgres/Vite, you'll likely need an S3-compatible service (AWS, Cloudflare R2) or base64 encode them if they are tiny (not recommended for 5 photos per log). Please decide architecture with Akbar based on stack constraints.
- **Forms:** The `job_logs` schema will need a new text array column for image URLs, or a new related table `job_log_photos` (id, logId, url, caption).
- **PDF Gen:** `jspdf` handles images via `addImage(base64Data, format, x, y, w, h)`. You will need to convert image URLs to base64 canvas objects locally before passing to the PDF generator. Watch out for CORS issues on S3 buckets.

## 7. Hand-off Notes for QA (Han)

- Test uploading on actual mobile device (iOS Safari and Android Chrome) to verify native camera access works via `<input type="file" accept="image/*" capture="environment">`.
- Verify the 5-photo limit cannot be bypassed by selecting multiple files at once from the gallery.
- Check behavior when a user loses internet connection mid-upload (should trigger error state).
- Verify PDF generation doesn't crash if an image URL 404s.