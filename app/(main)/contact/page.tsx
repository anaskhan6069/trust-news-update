import { Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactPage(): JSX.Element {
  return (
    <section className="container py-12">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Contact Us</h1>
        <p className="mt-4 text-gray-700 dark:text-gray-300">
          Reach the Trust News team for editorial questions, platform support, or media requests.
        </p>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-brand-red" />
              Phone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">000000000</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-brand-blue" />
              Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">admin@trustnews.com</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
