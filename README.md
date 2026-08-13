# Pharmacy Billing Phase 1

This is the first working frontend prototype.

## Features
- Enter bill, patient and doctor details
- Add/remove medicine rows
- Quantity, rate, discount and GST calculations
- Automatic CGST + SGST
- Automatic bill total, concession and round-off
- Amount in words
- Payment mode
- A4 landscape print layout
- Receipt layout based on the supplied Casualty Pharmacy receipt

## Run
Open `index.html` directly in Chrome/Edge.

For best local development:
1. Put all three files in the same folder.
2. Open `index.html`.
3. Edit bill data.
4. Click Print Bill.

## Next phase
Spring Boot + MySQL backend:
- medicine_master
- patients
- pharmacy_bill
- pharmacy_bill_items
- users
- stock / batches
- bill number generation
- save/load/reprint bills
