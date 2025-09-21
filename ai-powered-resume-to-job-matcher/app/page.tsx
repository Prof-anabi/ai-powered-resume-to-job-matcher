import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <main className="flex flex-col items-center max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
          AI-Powered Resume to Job Matcher
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Find the perfect job match with our AI-powered resume analysis and job recommendation system.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-12">
          <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm">
            <Image
              src="/file.svg"
              alt="Upload Resume"
              width={64}
              height={64}
              className="mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">Upload Resume</h3>
            <p className="text-muted-foreground text-center">Upload your resume and let our AI analyze your skills and experience.</p>
          </div>
          
          <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm">
            <Image
              src="/globe.svg"
              alt="Match Jobs"
              width={64}
              height={64}
              className="mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">Match Jobs</h3>
            <p className="text-muted-foreground text-center">Our AI matches your profile with suitable job opportunities.</p>
          </div>
          
          <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm">
            <Image
              src="/window.svg"
              alt="Apply"
              width={64}
              height={64}
              className="mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">Apply</h3>
            <p className="text-muted-foreground text-center">Apply to jobs with the highest match rate for better success.</p>
          </div>
        </div>
        
        <div className="flex gap-4 flex-col sm:flex-row">
          <Link 
            href="/get-started"
            className="rounded-full bg-primary text-primary-foreground px-8 py-3 font-medium hover:bg-primary/90"
          >
            Get Started
          </Link>
          <Link
            href="/auth/login"
            className="rounded-full border border-input bg-background px-8 py-3 font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Login
          </Link>
        </div>
      </main>
      
      <footer className="text-center text-muted-foreground mt-auto">
        <p>© {new Date().getFullYear()} AI-Powered Resume to Job Matcher. All rights reserved.</p>
      </footer>
    </div>
  );
}
