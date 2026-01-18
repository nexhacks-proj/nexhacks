// Mock raw resumes - these will be parsed by AI when loaded
export const mockWorkdayResumes = [
  {
    id: 'workday-1',
    name: 'Elena Rodriguez',
    email: 'elena.rodriguez@email.com',
    rawResume: `Elena Rodriguez
Senior Product Manager

EXPERIENCE
Workday | Senior Product Manager | 2021-Present
- Led the launch of Workday Talent Marketplace, achieving 1M+ MAU in first year
- Managed cross-functional team of 15 engineers and designers
- Defined product roadmap and strategy for HR analytics suite

Salesforce | Product Manager | 2018-2021
- Owned features for Sales Cloud mobile app
- Increased user engagement by 25% through UX improvements

EDUCATION
MBA, UC Berkeley Haas School of Business, 2018
BS Computer Science, UT Austin, 2013

SKILLS
Product Management, Agile, SQL, Data Analysis, Enterprise SaaS, UX Design`
  },
  {
    id: 'workday-2',
    name: 'Samuel Okonjo',
    email: 'samuel.okonjo@email.com',
    rawResume: `Samuel Okonjo
Enterprise Architect

EXPERIENCE
Oracle | Principal Architect | 2019-Present
- Designed cloud migration strategy for Fortune 100 clients
- specialized in high-availability distributed systems
- Led technical due diligence for 3 acquisitions

IBM | Senior Solution Architect | 2015-2019
- Architected hybrid cloud solutions using Red Hat OpenShift
- Published 2 white papers on enterprise security patterns

EDUCATION
MS Computer Science, Georgia Tech, 2015
BS Information Technology, University of Lagos, 2011

SKILLS
Cloud Architecture, AWS, Azure, Microservices, Java, Kubernetes, Enterprise Security`
  },
  {
    id: 'workday-3',
    name: 'Wei Zhang',
    email: 'wei.zhang@email.com',
    rawResume: `Wei Zhang
HRIS Analyst

EXPERIENCE
Adobe | HR Systems Analyst | 2022-Present
- Administrator for Workday HCM and Payroll modules
- Automated reporting processes using Python, saving 20 hours/week
- Led integration project with Greenhouse ATS

ServiceNow | HR Operations Specialist | 2020-2022
- Managed employee lifecycle data for 5000+ employees
- Improved data accuracy by 95% through validation scripts

EDUCATION
BS Business Information Systems, San Jose State University, 2020

SKILLS
Workday HCM, Python, SQL, Tableau, HR Operations, System Integration`
  }
]

export const mockRawResumes = [
  // === STRONG CANDIDATES ===
  {
    id: 'mock-1',
    name: 'Sarah Chen',
    email: 'sarah.chen@email.com',
    rawResume: `Sarah Chen
Senior Full-Stack Developer

EXPERIENCE
TechStartup Inc. (Series A) | Senior Engineer | 2021-Present
- Led migration from monolith to microservices, reducing deployment time by 70%
- Built real-time collaboration features serving 50K+ daily active users
- Mentored team of 4 junior developers

WebAgency Co. | Full-Stack Developer | 2019-2021
- Delivered 15+ client projects using React, Node.js, and PostgreSQL
- Implemented CI/CD pipelines reducing release cycles from weekly to daily

EDUCATION
BS Computer Science, UC Berkeley, 2019

SKILLS
TypeScript, React, Node.js, PostgreSQL, AWS, Docker, Kubernetes`
  },
  {
    id: 'mock-2',
    name: 'Priya Patel',
    email: 'priya.patel@email.com',
    rawResume: `Priya Patel
Backend Engineer

EXPERIENCE
ScaleUp Ventures (Seed Stage) | Founding Engineer | 2023-Present
- Built entire backend infrastructure from scratch using Go and PostgreSQL
- Designed event-driven architecture handling 1M+ events/day
- Implemented authentication, payments, and analytics systems

DataFlow Systems | Software Engineer | 2020-2023
- Developed high-throughput data pipelines processing 10TB+ daily
- Optimized query performance reducing P99 latency by 60%

EDUCATION
MS Computer Science, Stanford University, 2020
BS Computer Science, IIT Delhi, 2018

SKILLS
Go, Python, PostgreSQL, Redis, Kafka, AWS, Terraform`
  },
  {
    id: 'mock-3',
    name: 'Jordan Kim',
    email: 'jordan.kim@email.com',
    rawResume: `Jordan Kim
Mobile & Full-Stack Developer

EXPERIENCE
RocketShip (YC W22) | Senior Engineer | 2022-Present
- Employee #3, built iOS and Android apps from scratch
- Grew to 100K+ downloads, 4.8 star rating
- Wear many hats: mobile, backend, devops, customer support

NativeApps Studio | Mobile Developer | 2019-2022
- Built React Native apps for Fortune 500 clients
- Led team of 3 on healthcare app project

EDUCATION
BS Computer Science, UCLA, 2019

SKILLS
React Native, Swift, Kotlin, TypeScript, Node.js, Firebase, AWS`
  },
  {
    id: 'mock-4',
    name: 'Kevin Park',
    email: 'kevin.park@email.com',
    rawResume: `Kevin Park
Startup Generalist

EXPERIENCE
Failed Startup | Co-founder & CTO | 2022-2023
- Built MVP in 3 months, raised $500K seed
- Grew to 10K users before running out of runway
- Learned hard lessons about product-market fit

Successful Startup (Acquired) | First Engineer | 2019-2022
- Employee #2, built everything from auth to payments
- Scaled from 0 to 1M users
- $50M acquisition by public company

EDUCATION
BS Computer Science, KAIST, South Korea, 2019

SKILLS
TypeScript, React, Node.js, PostgreSQL, AWS, Startup Operations`
  },
  // === SOLID MID-LEVEL CANDIDATES ===
  {
    id: 'mock-5',
    name: 'Marcus Johnson',
    email: 'marcus.j@email.com',
    rawResume: `Marcus Johnson
Frontend Engineer

EXPERIENCE
BigCorp Technologies | Frontend Developer | 2022-Present
- Developed responsive web applications using React and TypeScript
- Improved Core Web Vitals scores by 40% across main product
- Collaborated with design team on component library

SmallShop Agency | Junior Developer | 2020-2022
- Built client websites using React and Next.js
- Maintained existing WordPress sites

EDUCATION
Bootcamp Graduate, App Academy, 2020
BA Economics, State University, 2018

SKILLS
JavaScript, TypeScript, React, CSS, Tailwind, Figma`
  },
  {
    id: 'mock-6',
    name: 'Rachel Green',
    email: 'rachel.green@email.com',
    rawResume: `Rachel Green
Product-Minded Engineer

EXPERIENCE
Notion | Software Engineer | 2021-Present
- Built collaborative features used by 20M+ users
- Led A/B testing framework reducing experiment time by 50%
- Work closely with PM and design, shipped 12 features end-to-end

Medium | Frontend Engineer | 2019-2021
- Improved editor performance by 3x
- Built reading analytics dashboard

EDUCATION
BS Computer Science & Design, Rhode Island School of Design, 2019

SKILLS
TypeScript, React, Node.js, PostgreSQL, Figma, User Research`
  },
  {
    id: 'mock-7',
    name: 'Nina Kowalski',
    email: 'nina.k@email.com',
    rawResume: `Nina Kowalski
DevOps & Platform Engineer

EXPERIENCE
FastGrowth Startup | Platform Lead | 2021-Present
- Built platform team from scratch, hired 4 engineers
- Reduced cloud costs by 45% through optimization
- Achieved 99.99% uptime SLA

CloudFirst Inc. | DevOps Engineer | 2018-2021
- Managed Kubernetes clusters for 50+ microservices
- Implemented GitOps workflows with ArgoCD

EDUCATION
BS Information Systems, University of Michigan, 2018

SKILLS
Kubernetes, Terraform, AWS, GCP, Python, Go, Prometheus, GitOps`
  },
  {
    id: 'mock-8',
    name: 'Alex Rivera',
    email: 'alex.r@email.com',
    rawResume: `Alex Rivera
Full-Stack Developer

EXPERIENCE
Freelance Developer | 2021-Present
- Built custom web applications for 20+ small business clients
- Specialized in e-commerce solutions using Shopify and custom builds
- Managed all client relationships and project timelines

Coffee Shop | Barista | 2019-2021
- Part-time while learning to code

EDUCATION
Self-taught developer
Online courses: freeCodeCamp, Udemy

SKILLS
JavaScript, React, Next.js, Node.js, MongoDB, Shopify`
  },
  // === JUNIOR / ENTRY-LEVEL CANDIDATES ===
  {
    id: 'mock-9',
    name: 'Tom Anderson',
    email: 'tom.anderson@email.com',
    rawResume: `Tom Anderson
Recent Graduate

EXPERIENCE
Software Engineering Intern | Meta | Summer 2023
- Built internal tool for code review automation
- Reduced review time by 20% for 50+ engineers

Research Assistant | University Lab | 2022-2023
- Worked on natural language processing research
- Co-authored paper on sentiment analysis

EDUCATION
BS Computer Science, University of Washington, 2023
GPA: 3.9, Magna Cum Laude

PROJECTS
- Open source contribution to React (100+ stars)
- Built multiplayer game with 5K downloads

SKILLS
Python, JavaScript, React, Machine Learning, Git`
  },
  {
    id: 'mock-10',
    name: 'Mike O\'Brien',
    email: 'mike.obrien@email.com',
    rawResume: `Mike O'Brien
Career Changer - Former Teacher

EXPERIENCE
Teaching Assistant | Codecademy | 2023-Present
- Help students learn JavaScript and Python
- Created curriculum for React fundamentals course

High School Math Teacher | Chicago Public Schools | 2015-2023
- Taught AP Calculus and Statistics for 8 years
- Built internal grading automation tool (Python)

EDUCATION
Coding Bootcamp, Flatiron School, 2023
MA Education, DePaul University, 2016
BA Mathematics, University of Illinois, 2014

PROJECTS
- Built gradebook app used by 20 teachers in my school
- Personal finance tracker with React and Firebase

SKILLS
JavaScript, React, Python, SQL, Teaching, Communication`
  },
  {
    id: 'mock-11',
    name: 'Emily Tran',
    email: 'emily.tran@email.com',
    rawResume: `Emily Tran
Junior Developer

EXPERIENCE
TechStart Agency | Junior Developer | 2023-Present
- Building web applications using React and Node.js
- Participating in code reviews and learning best practices
- Fixed 50+ bugs in first 6 months

EDUCATION
BS Computer Science, San Jose State, 2023
GPA: 3.4

PROJECTS
- Personal portfolio site with Next.js
- Weather app with React and OpenWeather API
- Contributed to 2 open source projects

SKILLS
JavaScript, React, Node.js, Git, HTML/CSS`
  },
  // === WEAKER CANDIDATES (realistic, not caricatures) ===
  {
    id: 'mock-12',
    name: 'David Thompson',
    email: 'david.t@email.com',
    rawResume: `David Thompson
Junior Developer

EXPERIENCE
Intern at Local Agency | Summer 2023
- Built landing pages using WordPress and basic HTML/CSS
- Assisted senior developers with testing

EDUCATION
BS Computer Science, State College, Expected 2024
GPA: 2.9

PROJECTS
- Personal blog built with WordPress
- Todo app following React tutorial

SKILLS
HTML, CSS, JavaScript basics, WordPress, Some React`
  },
  {
    id: 'mock-13',
    name: 'Jennifer Martinez',
    email: 'jenn.martinez@email.com',
    rawResume: `Jennifer Martinez
Software Developer

EXPERIENCE
WebDev Co | Frontend Developer | 2023 (6 months)
- Built React components for client projects
- Left to pursue other opportunities

StartupXYZ | Junior Developer | 2022-2023 (8 months)
- Worked on web application features
- Company downsized due to funding

Freelance | 2021-2022
- Small website projects for local businesses

EDUCATION
Online Bootcamp, 2021

SKILLS
HTML, CSS, JavaScript, React basics, WordPress`
  },
  {
    id: 'mock-14',
    name: 'Brian Walsh',
    email: 'brian.walsh@email.com',
    rawResume: `Brian Walsh
Developer

EXPERIENCE
IT Support | LocalCorp | 2020-Present
- Provide technical support for office staff
- Manage software installations and updates
- Started learning to code on the side

EDUCATION
Associate's Degree, Community College, 2020

PROJECTS
- Built personal website with HTML/CSS
- Learning Python through online courses
- Completed several Codecademy courses

SKILLS
Technical Support, HTML, CSS, Learning Python, Microsoft Office

Looking to transition into software development role.`
  },
  {
    id: 'mock-15',
    name: 'Chris Lee',
    email: 'chris.lee.dev@gmail.com',
    rawResume: `Chris Lee
Full Stack Developer

EXPERIENCE
Self-Employed | Freelance Developer | 2022-Present
- Various web projects for small clients
- Built 5-6 websites using different technologies

Retail | Sales Associate | 2019-2022
- Customer service while learning to code

EDUCATION
Some college coursework in Business
Self-taught programming through online resources

PROJECTS
- E-commerce site for friend's business
- Personal portfolio website

SKILLS
JavaScript, React, Node.js, MongoDB

Open to learning new technologies. Available to start immediately.`
  }
]

// Specialized mock resumes for testing email functionality
export const emailTestResumes = [
  {
    id: 'email-test-1',
    name: 'Strong Candidate (Test)',
    email: 'dpnimo11@gmail.com',
    rawResume: `Strong Candidate
Senior Developer

EXPERIENCE
Tech Giant | Senior Engineer | 2020-Present
- Led major initiatives
- Excellent track record

SKILLS
TypeScript, React, Node.js, Leadership`
  },
  {
    id: 'email-test-2',
    name: 'Weak Candidate (Test)',
    email: 'pzq0406@gmail.com',
    rawResume: `Weak Candidate
Junior Developer

EXPERIENCE
None yet

SKILLS
Basic HTML`
  }
]

export function getRawResumesForJob(jobId: string) {
  return mockRawResumes.map(r => ({
    ...r,
    jobId
  }))
}

// Add uploaded resume to the mock pool
export function addToMockResumes(resume: { id: string; name: string; email: string; rawResume: string }) {
  mockRawResumes.push(resume)
}
