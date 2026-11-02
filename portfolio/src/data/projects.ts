export interface ProjectDetail {
  title: string;
  category: string;
  paragraphs: string[];
  skills: string[];
  url?: string;
  note?: string;
}

export const projects: Record<string, ProjectDetail> = {
  lanclos: {
    title: 'Lanclos Electronics', category: 'CLIENT WORK / BUSINESS WEBSITE',
    paragraphs: [
      'I created the Lanclos Electronics business website, working directly with the client to turn their business requirements into a working site.',
      'This project is an example of the business website development offered through Jake DevWorks. Each project starts with understanding the business, its customers, and the information those customers need.'
    ],
    skills: ['Client requirements', 'Business website development'],
    url: 'https://www.lancloselectronics.com'
  },
  nasa: {
    title: 'RFID asset tracking', category: 'NASA INTERNSHIP / STENNIS SPACE CENTER / JAN–MAY 2020',
    paragraphs: [
      'During my internship at NASA’s Stennis Space Center, I led implementation of an RFID system for tracking high-value technology assets in the Hive testbed.',
      'I developed a Java application with a graphical interface to operate the RFID system, transfer data to MySQL, and generate alerts. The project also involved coordinating milestones and documentation across departments and working within NASA’s data safety guidelines.'
    ],
    skills: ['Java & graphical interfaces', 'MySQL', 'Hardware integration', 'Technical documentation']
  },
  relief: {
    title: 'Relief Telemed vaccination platform',
    category: 'RELIEF TELEMED / COVID-19 VACCINATION EVENTS',
    paragraphs: [
      'I worked with Relief Telemed on a registration and documentation platform supporting its COVID-19 vaccination events in Baton Rouge.',
      'I developed the API with Python and Django, backed by PostgreSQL, and worked on the main web application using React, TypeScript, and JavaScript to handle registration and vaccination documentation.',
      'I also managed continuous integration and deployment with CircleCI and hosted the application on Aptible.'
    ],
    skills: ['Python & Django API', 'PostgreSQL', 'React, TypeScript & JavaScript', 'CircleCI CI/CD', 'Aptible hosting']
  },
  clinic: {
    title: 'Helping a clinic get found', category: 'CLIENT WORK / ONLINE PRESENCE',
    paragraphs: [
      'I helped Women’s Medical and Surgical Clinic strengthen its online presence by setting up Yelp and Google Business Profile accounts and optimizing website SEO.',
      'The work focused on establishing business listings and improving the clinic’s visibility in search results.'
    ],
    skills: ['Google Business Profile', 'Yelp business listing', 'Website SEO']
  },
  recipes: {
    title: 'Recipes, preserved digitally', category: 'PERSONAL PROJECT / RECIPE EXTRACTION',
    paragraphs: [
      'One of my personal projects explores extracting recipes from vintage cookbooks and organizing them digitally.',
      'The existing website repository includes a Django cookbook application, recipe data, and templates for browsing recipes and authors. It’s a project that brings my interest in software together with my interest in cooking.'
    ],
    skills: ['Python & Django', 'Data extraction', 'Structured recipe data'],
    url: 'https://github.com/GreatestJakeEVR/mywebsite/tree/master/cookbook'
  }
};
