// Mock raw resumes - these will be parsed by AI when loaded
export const mockRawResumes = [
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
    name: 'Marcus Johnson',
    email: 'marcus.j@email.com',
    rawResume: `Marcus Johnson
Frontend Engineer

EXPERIENCE
BigCorp Technologies | Frontend Developer | 2022-Present
- Developed responsive web applications using React and TypeScript
- Improved Core Web Vitals scores by 40% across main product
- Collaborated with design team on component library

EDUCATION
Bootcamp Graduate, App Academy, 2022
BA Economics, State University, 2020

SKILLS
JavaScript, TypeScript, React, CSS, Tailwind, Figma`
  },
  {
    id: 'mock-3',
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
    id: 'mock-4',
    name: 'Alex Rivera',
    email: 'alex.r@email.com',
    rawResume: `Alex Rivera
Full-Stack Developer

EXPERIENCE
Freelance Developer | 2021-Present
- Built custom web applications for 20+ small business clients
- Specialized in e-commerce solutions using Shopify and custom builds

Coffee Shop | Barista | 2019-2021
- Part-time while learning to code

EDUCATION
Self-taught developer
Online courses: freeCodeCamp, Udemy, YouTube

SKILLS
JavaScript, React, Next.js, Node.js, MongoDB, Shopify`
  },
  {
    id: 'mock-5',
    name: 'Emily Watson',
    email: 'emily.watson@email.com',
    rawResume: `Emily Watson
Senior Software Engineer

EXPERIENCE
Google | Senior Software Engineer | 2018-Present
- Tech lead for 8-person team on Google Cloud Platform
- Designed distributed systems serving billions of requests
- 3 promotions in 5 years, consistently exceeds expectations

Microsoft | Software Engineer | 2015-2018
- Worked on Azure infrastructure team
- Contributed to open-source .NET projects

EDUCATION
MS Computer Science, MIT, 2015
BS Computer Science, Carnegie Mellon, 2013

SKILLS
Java, Python, C++, Kubernetes, GCP, Distributed Systems`
  },
  {
    id: 'mock-6',
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
    id: 'mock-7',
    name: 'David Thompson',
    email: 'david.t@email.com',
    rawResume: `David Thompson
Junior Developer

EXPERIENCE
Intern at Local Agency | Summer 2023
- Built landing pages using WordPress
- Learned basics of HTML/CSS/JavaScript

EDUCATION
BS Computer Science, State College, 2024 (Expected)
GPA: 2.8

SKILLS
HTML, CSS, JavaScript basics, WordPress`
  },
  {
    id: 'mock-8',
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
