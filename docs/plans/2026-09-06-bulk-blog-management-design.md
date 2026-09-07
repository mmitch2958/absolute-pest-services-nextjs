# Bulk Blog Image Regeneration and Deletion

## Goal

Give administrators safe bulk controls for repairing blog posts with missing
hero images and removing multiple blog posts without opening each post
individually.

## Approved design

- Add a checkbox to each blog post row and a select-all checkbox for the
  currently loaded/search-filtered list.
- Show `Regenerate Selected Images` and `Delete Selected` when rows are
  selected.
- Show `Regenerate All Missing Images` as a separate action that queries the
  server for all posts whose image is blank or uses a known broken legacy path
  (`/blog-images/...` or `/uploads/blog-images/...`).
- Regenerate selected posts intentionally even when they currently have an
  image; the all-missing action must not overwrite valid external image URLs.
- Process image regeneration sequentially in one authenticated server request,
  saving each successful image immediately through the existing App Storage
  helper and returning progress events to the admin UI.
- Show a progress modal with per-post status, success count, and individual
  failures. A failed item must not prevent later items from running.
- Require an explicit confirmation before bulk deletion, then delete the
  selected posts in one database operation.

## Data flow

1. The admin selects rows or chooses the all-missing action.
2. The client sends either selected IDs or the all-missing mode to an
   authenticated bulk image endpoint.
3. The server loads the post title/category/excerpt, generates one image at a
   time using the existing provider logic, persists it to App Storage, and
   updates that post immediately.
4. The server emits progress and result events; the client renders them and
   refreshes the table when complete.
5. Bulk deletion sends selected IDs to a separate authenticated endpoint,
   performs one constrained delete, clears the selection, and refreshes the
   list.

## Safety and failure handling

- Admin authentication is required for both endpoints.
- Empty selections are rejected.
- Bulk deletion is never performed without a client confirmation.
- Image failures are isolated per post and remain retryable.
- Legacy image paths are treated as missing only by the all-missing action;
  valid external URLs are preserved.
- Existing individual edit, image generation, and delete flows remain
  available.

## Verification

- Type-check the changed routes and client page.
- Exercise the bulk delete endpoint with an empty selection and a valid
  selection in a controlled test.
- Exercise image regeneration with a small set and verify successful URLs use
  `/api/blog-images/...`.
- Confirm the admin UI shows selection, progress, confirmation, and refresh
  states.