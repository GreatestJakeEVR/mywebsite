import type { Content } from '../lib/content.ts';

// Reviewed local content, used for offline preview and non-destructive initial CMS import.
export const defaultContent: Content = {
  "posts": [
    {
      "_id": "post-welcome",
      "title": "A home for software and things worth making.",
      "slug": "welcome",
      "excerpt": "An introduction to Jake DevWorks, the work I do, and what you’ll find here.",
      "publishedAt": "2026-11-01T12:00:00-06:00",
      "category": "STUDIO NOTES",
      "author": "Jake DevWorks",
      "body": [
        {
          "_type": "block",
          "_key": "block-0",
          "style": "normal",
          "markDefs": [],
          "children": [
            {
              "_type": "span",
              "_key": "span-0",
              "text": "I’m Jake Ardoin, a software developer and maker in Baton Rouge, Louisiana. Jake DevWorks brings together the work I do with software, websites, and physical design.",
              "marks": []
            }
          ]
        },
        {
          "_type": "block",
          "_key": "block-1",
          "style": "normal",
          "markDefs": [],
          "children": [
            {
              "_type": "span",
              "_key": "span-1",
              "text": "I help businesses and individuals bring their ideas to life—whether that means simplifying a business process, creating a website and building an online presence, or designing something you can hold. From the first conversation to the finished project, you’ll work directly with me.",
              "marks": []
            }
          ]
        },
        {
          "_type": "block",
          "_key": "block-2",
          "style": "h2",
          "markDefs": [],
          "children": [
            {
              "_type": "span",
              "_key": "span-2",
              "text": "Software that fits the job",
              "marks": []
            }
          ]
        },
        {
          "_type": "block",
          "_key": "block-3",
          "style": "normal",
          "markDefs": [],
          "children": [
            {
              "_type": "span",
              "_key": "span-3",
              "text": "My development work includes custom applications, APIs, automation, and AI tools. I work with clients to understand their requirements and turn those into working software, including the infrastructure and documentation that support it.",
              "marks": []
            }
          ]
        },
        {
          "_type": "block",
          "_key": "block-4",
          "style": "h2",
          "markDefs": [],
          "children": [
            {
              "_type": "span",
              "_key": "span-4",
              "text": "A home for your business online",
              "marks": []
            }
          ]
        },
        {
          "_type": "block",
          "_key": "block-5",
          "style": "normal",
          "markDefs": [],
          "children": [
            {
              "_type": "span",
              "_key": "span-5",
              "text": "A business website should make it easy to understand what you offer and how to contact you. My work also includes helping businesses establish their online presence through business listings and website SEO.",
              "marks": []
            }
          ]
        },
        {
          "_type": "block",
          "_key": "block-6",
          "style": "h2",
          "markDefs": [],
          "children": [
            {
              "_type": "span",
              "_key": "span-6",
              "text": "From a model to a physical piece",
              "marks": []
            }
          ]
        },
        {
          "_type": "block",
          "_key": "block-7",
          "style": "normal",
          "markDefs": [],
          "children": [
            {
              "_type": "span",
              "_key": "span-7",
              "text": "I also offer custom 3D design and printing for businesses, hobbies, and decoration. That can mean a practical accessory, a prototype, a display, or a personalized piece.",
              "marks": []
            }
          ]
        },
        {
          "_type": "block",
          "_key": "block-8",
          "style": "normal",
          "markDefs": [],
          "children": [
            {
              "_type": "span",
              "_key": "span-8",
              "text": "A useful starting point is a sketch, a photo, or an existing model, along with the dimensions and a description of how you intend to use the finished item.",
              "marks": []
            }
          ]
        },
        {
          "_type": "block",
          "_key": "block-9",
          "style": "h2",
          "markDefs": [],
          "children": [
            {
              "_type": "span",
              "_key": "span-9",
              "text": "What you’ll find here",
              "marks": []
            }
          ]
        },
        {
          "_type": "block",
          "_key": "block-10",
          "style": "normal",
          "markDefs": [],
          "children": [
            {
              "_type": "span",
              "_key": "span-10",
              "text": "This site is a place for project examples and notes from the workbench: software development, design decisions, printing experiments, and the details behind a build.",
              "marks": []
            }
          ]
        },
        {
          "_type": "block",
          "_key": "block-11",
          "style": "normal",
          "markDefs": [],
          "children": [
            {
              "_type": "span",
              "_key": "span-11",
              "text": "If you have a project in mind, tell me about it. We can work out what it needs and where to start.",
              "marks": []
            }
          ]
        }
      ]
    }
  ],
  "projects": [
    {
      "_id": "project-lanclos",
      "key": "lanclos",
      "title": "Lanclos Electronics",
      "category": "CLIENT WORK / BUSINESS WEBSITE",
      "paragraphs": [
        "I created the Lanclos Electronics business website, working directly with the client to turn their business requirements into a working site.",
        "This project is an example of the business website development offered through Jake DevWorks. Each project starts with understanding the business, its customers, and the information those customers need."
      ],
      "skills": [
        "Client requirements",
        "Business website development"
      ],
      "url": "https://www.lancloselectronics.com",
      "filter": "websites",
      "summary": "A business website built for a local electronics company.",
      "labels": [
        "WEB DEVELOPMENT",
        "CLIENT WORK"
      ],
      "visual": "electronics",
      "symbol": "",
      "wide": false,
      "order": 0
    },
    {
      "_id": "project-nasa",
      "key": "nasa",
      "title": "RFID asset tracking",
      "category": "NASA INTERNSHIP / STENNIS SPACE CENTER / JAN–MAY 2020",
      "paragraphs": [
        "During my internship at NASA’s Stennis Space Center, I led implementation of an RFID system for tracking high-value technology assets in the Hive testbed.",
        "I developed a Java application with a graphical interface to operate the RFID system, transfer data to MySQL, and generate alerts. The project also involved coordinating milestones and documentation across departments and working within NASA’s data safety guidelines."
      ],
      "skills": [
        "Java & graphical interfaces",
        "MySQL",
        "Hardware integration",
        "Technical documentation"
      ],
      "filter": "software",
      "summary": "Connecting physical equipment with a Java application and MySQL database.",
      "labels": [
        "APPLICATION DEVELOPMENT",
        "NASA INTERNSHIP"
      ],
      "visual": "nasa",
      "symbol": "",
      "wide": false,
      "order": 1
    },
    {
      "_id": "project-relief",
      "key": "relief",
      "title": "Relief Telemed vaccination platform",
      "category": "RELIEF TELEMED / COVID-19 VACCINATION EVENTS",
      "paragraphs": [
        "I worked with Relief Telemed on a registration and documentation platform supporting its COVID-19 vaccination events in Baton Rouge.",
        "I developed the API with Python and Django, backed by PostgreSQL, and worked on the main web application using React, TypeScript, and JavaScript to handle registration and vaccination documentation.",
        "I also managed continuous integration and deployment with CircleCI and hosted the application on Aptible."
      ],
      "skills": [
        "Python & Django API",
        "PostgreSQL",
        "React, TypeScript & JavaScript",
        "CircleCI CI/CD",
        "Aptible hosting"
      ],
      "filter": "software",
      "summary": "Registration and vaccination documentation for COVID-19 vaccination events in Baton Rouge.",
      "labels": [
        "FULL-STACK DEVELOPMENT",
        "RELIEF TELEMED"
      ],
      "visual": "compact",
      "symbol": "RT",
      "wide": true,
      "order": 2
    },
    {
      "_id": "project-clinic",
      "key": "clinic",
      "title": "Helping a clinic get found",
      "category": "CLIENT WORK / ONLINE PRESENCE",
      "paragraphs": [
        "I helped Women’s Medical and Surgical Clinic strengthen its online presence by setting up Yelp and Google Business Profile accounts and optimizing website SEO.",
        "The work focused on establishing business listings and improving the clinic’s visibility in search results."
      ],
      "skills": [
        "Google Business Profile",
        "Yelp business listing",
        "Website SEO"
      ],
      "filter": "websites",
      "summary": "Business listings and website SEO for Women’s Medical and Surgical Clinic.",
      "labels": [
        "ONLINE PRESENCE"
      ],
      "visual": "compact",
      "symbol": "◎",
      "wide": false,
      "order": 3
    },
    {
      "_id": "project-recipes",
      "key": "recipes",
      "title": "Recipes, preserved digitally",
      "category": "PERSONAL PROJECT / RECIPE EXTRACTION",
      "paragraphs": [
        "One of my personal projects explores extracting recipes from vintage cookbooks and organizing them digitally.",
        "An earlier version of this repository includes a Django cookbook application, recipe data, and templates for browsing recipes and authors. It’s a project that brings my interest in software together with my interest in cooking."
      ],
      "skills": [
        "Python & Django",
        "Data extraction",
        "Structured recipe data"
      ],
      "url": "https://github.com/GreatestJakeEVR/mywebsite/tree/f4181f95873a0c83b4f849b788b89d33d3595064/cookbook",
      "filter": "personal",
      "summary": "Exploring recipe extraction from vintage cookbooks.",
      "labels": [
        "PERSONAL PROJECT"
      ],
      "visual": "compact",
      "symbol": "{ }",
      "wide": false,
      "order": 4
    }
  ],
  "services": [
    {
      "_id": "service-software",
      "key": "software",
      "title": "Software &\napp development",
      "description": "Software built around how you work. Custom applications, useful automations, and connected systems that help you get things done.",
      "features": [
        "Custom applications & business tools",
        "APIs & system integrations",
        "Workflow automation & AI tools"
      ],
      "cta": "Discuss a software project",
      "selection": "Software & apps",
      "icon": "</>",
      "order": 0
    },
    {
      "_id": "service-websites",
      "key": "websites",
      "title": "Websites &\nonline presence",
      "description": "A professional home for your business online, with clear information and straightforward ways for customers to find and contact you.",
      "features": [
        "Custom business websites",
        "Google Business Profile & listings",
        "SEO & search visibility"
      ],
      "cta": "Build your online presence",
      "selection": "Websites & online presence",
      "icon": "↗",
      "order": 1
    },
    {
      "_id": "service-printing",
      "key": "printing",
      "title": "3D design &\nprinting",
      "description": "From a sketch or an existing model to a finished piece. Custom design and printing for businesses, hobby projects, and decoration.",
      "features": [
        "Custom models & prototypes",
        "Practical parts & hobby accessories",
        "Décor, displays & personalized pieces"
      ],
      "cta": "Make something physical",
      "selection": "3D design & printing",
      "icon": "◇",
      "order": 2
    }
  ]
};
