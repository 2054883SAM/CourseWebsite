import Link from 'next/link';
import { PageLayout, Section, Container, GridLayout, ContentBlock } from '../components/layout';

export default function Home() {
  return (
    <PageLayout>
      {/* Hero Section */}
      <Section className="py-16 text-center md:py-24">
        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Welcome to Course Website
        </h1>
        <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600 dark:text-gray-400">
          An online learning platform with interactive video courses and comprehensive learning
          materials.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/courses"
            className="ring-offset-background inline-flex h-11 items-center justify-center rounded-md bg-primary-600 px-6 text-base font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Browse Courses
          </Link>
          <Link
            href="/about"
            className="ring-offset-background inline-flex h-11 items-center justify-center rounded-md border border-gray-200 px-6 text-base font-medium transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:hover:bg-gray-800"
          >
            Learn More
          </Link>
        </div>
      </Section>

      {/* Featured Courses Section */}
      <Section className="bg-gray-50 dark:bg-gray-800">
        <h2 className="mb-12 text-center text-3xl font-bold">Featured Courses</h2>

        <GridLayout columns={{ default: 1, sm: 2, lg: 3 }} className="mb-12">
          {/* Course card placeholders */}
          {[1, 2, 3].map((i) => (
            <ContentBlock key={i} variant="card" className="p-6">
              <div className="mb-4 aspect-video rounded-md bg-gray-200 dark:bg-gray-700"></div>
              <h3 className="mb-2 text-xl font-bold">Course Title {i}</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Learn everything about this amazing subject with our comprehensive course.
              </p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary-600 dark:text-primary-400">$49.99</span>
                <Link
                  href={`/courses/${i}`}
                  className="ring-offset-background inline-flex h-9 items-center justify-center rounded-md bg-primary-600 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
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
            className="ring-offset-background inline-flex h-11 items-center justify-center rounded-md border border-gray-200 px-6 text-base font-medium transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:hover:bg-gray-800"
          >
            View All Courses
          </Link>
        </div>
      </Section>

      {/* Features Section */}
      <Section>
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Why Choose Our Platform</h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-400">
            We provide the best learning experience with cutting-edge features.
          </p>
        </div>

        <GridLayout columns={{ default: 1, sm: 2, lg: 3 }} gap="gap-8">
          {[
            {
              title: 'High-Quality Content',
              description:
                'All courses are created by industry experts and undergo rigorous quality checks.',
            },
            {
              title: 'Interactive Learning',
              description: 'Engage with interactive exercises, quizzes, and hands-on projects.',
            },
            {
              title: 'Learn at Your Pace',
              description: 'Access course materials anytime, anywhere, and learn at your own pace.',
            },
            {
              title: 'Community Support',
              description: 'Join our community of learners and get help when you need it.',
            },
            {
              title: 'Certificates',
              description: 'Earn certificates upon completion to showcase your new skills.',
            },
            {
              title: '24/7 Support',
              description: 'Our support team is always ready to help you with any questions.',
            },
          ].map((feature, i) => (
            <ContentBlock key={i} variant="card" className="p-6">
              <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </ContentBlock>
          ))}
        </GridLayout>
      </Section>

      {/* Call to Action Section */}
      <Section className="bg-primary-50 py-16 text-center dark:bg-primary-900/20">
        <h2 className="mb-4 text-3xl font-bold">Ready to Start Learning?</h2>
        <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600 dark:text-gray-400">
          Join thousands of students already learning on our platform.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="ring-offset-background inline-flex h-11 items-center justify-center rounded-md bg-primary-600 px-6 text-base font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Sign Up Now
          </Link>
          <Link
            href="/courses"
            className="ring-offset-background inline-flex h-11 items-center justify-center rounded-md border border-gray-200 px-6 text-base font-medium transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:hover:bg-gray-800"
          >
            Browse Courses
          </Link>
        </div>
      </Section>
    </PageLayout>
  );
}
