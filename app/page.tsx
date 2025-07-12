import Link from 'next/link';
import { PageLayout, Section, Container, GridLayout, ContentBlock } from "../components/layout";

export default function Home() {
  return (
    <PageLayout>
      {/* Hero Section */}
      <Section className="text-center py-16 md:py-24">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
          Welcome to Course Website
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
          An online learning platform with interactive video courses and comprehensive learning materials.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/courses" 
            className="inline-flex items-center justify-center rounded-md text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary-600 hover:bg-primary-700 text-white h-11 px-6"
          >
            Browse Courses
          </Link>
          <Link 
            href="/about" 
            className="inline-flex items-center justify-center rounded-md text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 h-11 px-6"
          >
            Learn More
          </Link>
        </div>
      </Section>

      {/* Featured Courses Section */}
      <Section className="bg-gray-50 dark:bg-gray-800">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Courses</h2>
        
        <GridLayout 
          columns={{ default: 1, sm: 2, lg: 3 }}
          className="mb-12"
        >
          {/* Course card placeholders */}
          {[1, 2, 3].map((i) => (
            <ContentBlock key={i} variant="card" className="p-6">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-md mb-4"></div>
              <h3 className="text-xl font-bold mb-2">Course Title {i}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Learn everything about this amazing subject with our comprehensive course.
              </p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-primary-600 dark:text-primary-400">$49.99</span>
                <Link 
                  href={`/courses/${i}`}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary-600 hover:bg-primary-700 text-white h-9 px-4"
                >
                  View Course
                </Link>
              </div>
            </ContentBlock>
          ))}
        </GridLayout>
        
        <div className="text-center">
          <Link 
            href="/courses" 
            className="inline-flex items-center justify-center rounded-md text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 h-11 px-6"
          >
            View All Courses
          </Link>
        </div>
      </Section>

      {/* Features Section */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose Our Platform</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            We provide the best learning experience with cutting-edge features.
          </p>
        </div>
        
        <GridLayout columns={{ default: 1, sm: 2, lg: 3 }} gap="gap-8">
          {[
            {
              title: 'High-Quality Content',
              description: 'All courses are created by industry experts and undergo rigorous quality checks.'
            },
            {
              title: 'Interactive Learning',
              description: 'Engage with interactive exercises, quizzes, and hands-on projects.'
            },
            {
              title: 'Learn at Your Pace',
              description: 'Access course materials anytime, anywhere, and learn at your own pace.'
            },
            {
              title: 'Community Support',
              description: 'Join our community of learners and get help when you need it.'
            },
            {
              title: 'Certificates',
              description: 'Earn certificates upon completion to showcase your new skills.'
            },
            {
              title: '24/7 Support',
              description: 'Our support team is always ready to help you with any questions.'
            }
          ].map((feature, i) => (
            <ContentBlock key={i} variant="card" className="p-6">
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </ContentBlock>
          ))}
        </GridLayout>
      </Section>

      {/* Call to Action Section */}
      <Section className="bg-primary-50 dark:bg-primary-900/20 text-center py-16">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
          Join thousands of students already learning on our platform.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/signup" 
            className="inline-flex items-center justify-center rounded-md text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary-600 hover:bg-primary-700 text-white h-11 px-6"
          >
            Sign Up Now
          </Link>
          <Link 
            href="/courses" 
            className="inline-flex items-center justify-center rounded-md text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 h-11 px-6"
          >
            Browse Courses
          </Link>
        </div>
      </Section>
    </PageLayout>
  );
}
