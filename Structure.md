- auth
- booking
    - bookings
    - promotions
- property
    - category
    - property
    - propertyTypes
    - amenities
    - reviews



Security
- JWT
    - Token Sign in check
    - User Verification
    - 15 round salt
    - Signature Verification
    - Algorithm verification
    - Key Verification

Apis
- Search API for Properties Public Api. With category as filter
- Property Detail Api Public
- Property Booking Api

- Auth Api for sing in and sign up.

- Authentication Flow
    - Session Bases only
    - locationStorage token will be verified every time when user starts its session
        - Flow
            - User visit website 
            - User login
            - At the time of login server will respond 2 token. one is sessionToken and authToken
            - authToken will be stored in localStorage
            - sessionToken will be stored in sessionStorage
            - For all api calls will use sessionToken as bearerToken in Authorization. except one api
            - When user revisit the page
            - There will be a fixed api which will be used to verify authToken. 
            - This api call will have deviceInfo and authToken in body. POST
            - Server will give two kind of response
            - Error above and including 400 response. Just do logout.
            - Success case will return sessionToken.
            - Store this in sessionStorage and start other api calls.
    - Session and phone detection other meta data that is available like ip location.


Property Schema
- name
- basicDescription
- fullDescription
- amenities: [] // refers amenities table
- additionalAmenities
- propertyType
- category
- address
    - city
    - state
    - mapLink
    - lat
    - lng
    - fullAddress
    - landmark
- contactInfo
    - email
    - additionalMobiles:[]
    - primaryMobile
    - primaryContactPersonName - optional
    - 
- gallery:[{ order: number, link: string }]
- coverPhotos: { display: 2 at once, 3 at once, 1 at once, data: [{ order, link }] }
- thumbnailImage: { display: 2 at once, 3 at once, 1 at once, data: [{ order, link }] }
- hostedById // mean user id
- price: [] // according to type seat days etc


Auth Schema
- name // string
- email // string
- phone // number
- basicDescription // string or html
- role // string
- password // string
- otpInfo: [] // all logs for otp when ever it was generated
- loginInfo: [] // all logs of login, like city, timestamp, browser, ip, deviceType, also type - new login or old login
- firebaseToken // string
- interests: [] // this is auto generated based on searches.
- searchTexts: [] // store texts as string
- previouslyViewed: [] // store ids
- likedProperties: [] // store ids


Booking Schema





// todays task

Auth Api Structure

Roles:
- Vendor
- User
- Admin

otpInfo will have otp type. can only generate 3 time in 1hour.

Apis
- login - common for all
- signup
- forget-password // resend we will use same just we will verify otp counts
- verify-otp
- change-password // this can be used with both after user login change password and forget password. just pass sessionToken as "token" and in case of forgetPassword pass "token"
- signup-vendor
    - Need to ask information that will be used for sign up
- send-otp-email
- verify-email

------ Workflow ------
- User sign up. 
- User can login into account but before booking he needs to verify email.
- for that /send-account-verification-mail will be used.
- for verification of ot /verify-email will be used.
- These both will require sessionToken as bearer token in header.



------------------------
Additional Fields for Property

Different Types of Property
- water park
- resort
- villa
- farmhouse
- amusement park
- banquet hall
- hotel
    - hall - for events
    - room booking

- openingHours


Category


Event(hotel, resort)
    - no of people - max 30 - above 30 just show request a callback
    - include food - request callback
    - include decoration - request callback
    - duration - startTime and endTime we will ask

Stay(Vila, farmhouse)
    - no of people
    - no of days - startDate endDate
    - no of rooms

Day(amusement park, water park)
    - no of people

Stay(hotel)
    - no of people
    - no of rooms
    - no of days - checkIn and checkOut date

Event(banquet hall)
    - just show request a callback


----------
Starting With Water Park and Amusement Park Bookings

Day Type Property Booking
- StartDate
- NoOfPeople
- TotalAmount
- PropertyId
- HostedById
- QRCodesIds

Entry
- time
- type
- qrCodeId