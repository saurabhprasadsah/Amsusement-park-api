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