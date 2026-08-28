# CV builder

#### What is the idea here? 

The objective of this project is to create an app capable of building on-demand CVs for users either through manual selection of pre-written sections, bullet points or through job description analysis and AI suggestions. The idea is to build ATS friendly CVs that are optimized for the job description and the user's profile.

The idea is for the user to have 2 types of data. Immutable data and mutable data.

- The immutable data is like the name, linkedin, portfolio...
- The mutable represents the data present in the CV sections. There can also be custom sections if needed.

The way the project will be structured is through these layers: 

- Database that stores:
  - User information though pre defined data (name, linkedin, portfolio, etc.). there can also be a table like user_custom_data that will store custom data for the user. The user table will also store a pointer to the data the user has selected for the CV sections that will stored as a json in an S3 bucket.

Server where the job description analysis, AI suggestions and CV compiling will be done. Job description analysis will be done through a combination of NLP and algoirithms that will extract the most relevant keywords and skills from the job description. AI suggestions will be generated based on the user's profile and the job description analysis. The server will also handle the compilation of the CV sections into a final document format (PDF, DOCX, etc.).

Client side will serve as the interface for the user to input their data and select what they need to display if they choose manual selection. When user is inputing data, there needs to be client side validation beyond security measures. Validation like ensuring titles are not too long, bullet points include listed skills, bullet points are meaningful with action verbs, data from what was done in job etc...