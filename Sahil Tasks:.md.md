Sahil Tasks:
- Date Picker is not working
- Open a modal on click of Book Your Ticket
    - Add Field For Couupon Code
    - Show 2 button 
        - Book Now
        - Cancel
- Fix Card Height for "Most Loved Properties" according to search result card. "http://localhost:4200/search-result?name=Patna"
-Add a button to add it to wishlist
    - Create a component for this also pass propertyId to it. 
    - This will show in card and detail view both. 
    - a small but clickable heart icon

- Create a new page wishlist - low priority
    - From here user can delete and see list of wishlist

Vendor
- Create a new method for discount.
- 2kind of  discount can be added
    - Flat discount
        - Show Two Fields
            - Flat discount amount
            - Label for the offer. Like "Flat 10% off"
    - Percentage discount - Two row of fields for children and adult. These fields can be added multiple times. means. more than 3 people can have different discount. more than 5 can have different discount.
        - Min Person
        - Amount
        - Children / Person

- During Property Type Selection. 
    - After user select property type.
    - Show a radio for "Category"
        - Show them all properties present in selected property type.

- Make Sure Image Can be delete after upload. this applies for all. 
- Edit and Add Property Steps should have same UI. 
- Full Description and Basic Description both are required. 
- Call Amenities api for amenities. 
    - APi data will include icons also. so show them checkboxes with icons to select. 
- contactInfo
    - all fields are required except for "additionalMobiles"


- City should be selected from dropdown. State will be disabled  but value should be filled in.
- Add a new field for "tags"
    - This will be used for searches. - current search will be not work based on this.



------------
Add A loading indicator when user click on Confirm Booking Button. I had added a variable for that. make sure this will full page loading indicator. "isBookingConfirmationLoading"

Add a checkbox for pay later. Inside booking confirmation modal. Connect it with isPayLater. 

Clear Coupon code when modal is closed. 

this.homeService.makeBooking(booking).subscribe({
iske error pe ek message dikha dena. with error message

code me data dekhna ho kaise hai to - debugger; text add kar dena instead of console. It will show data in better way. THis will only work with js code. 

Make design and functionalities compaitable with mobile also. 

Error will contain message and status code always. { message }
----------

Pranav Pending
- Create wishlist api
- Create Review and testimonial api
- add search based on tags.

