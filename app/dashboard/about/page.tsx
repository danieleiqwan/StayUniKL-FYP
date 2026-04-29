import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
    return (
        <div className="container mx-auto p-6 transition-colors">
            <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">About StayUniKL</h1>

            <div className="grid gap-6">
                <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 transition-colors">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white">Our Mission</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                            StayUniKL is dedicated to transforming the student accommodation experience at UniKL MIIT.
                            Our platform digitizes the entire hostel management process, from application to approval,
                            making it seamless, transparent, and efficient for both students and administrators.
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 transition-colors">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white">Key Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
                            <li><strong className="text-slate-900 dark:text-white">Easy Application:</strong> Apply for rooms online without the paperwork.</li>
                            <li><strong className="text-slate-900 dark:text-white">Real-time Updates:</strong> Track your application status instantly.</li>
                            <li><strong className="text-slate-900 dark:text-white">Facility Booking:</strong> Book multipurpose courts and view gym/laundry schedules.</li>
                            <li><strong className="text-slate-900 dark:text-white">Efficient Management:</strong> Admin tools for streamlined approval workflows.</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 transition-colors">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white">Contact Us</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600 dark:text-slate-400">For any inquiries or support, please contact the Student Affairs Department.</p>
                        <p className="mt-2 text-[#F26C22] hover:underline">
                            <a href="mailto:support@stayunikl.edu.my">support@stayunikl.edu.my</a>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
