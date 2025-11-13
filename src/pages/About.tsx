import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">About Us</h1>

      {/* Mission Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Our Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">
            At CycleIt Swap Connect, our mission is to promote sustainable living by facilitating the exchange of bicycles and related gear. We believe in reducing waste, encouraging community sharing, and making cycling accessible to everyone. Join us in creating a greener future, one swap at a time.
          </p>
        </CardContent>
      </Card>

      {/* Team Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Our Team</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Our dedicated team is passionate about sustainability and technology. We work tirelessly to build a platform that connects cyclists and fosters a community of eco-conscious individuals.
          </p>
          <ul className="list-disc list-inside">
            <li><strong>Shubham Gupta:</strong> Founder and Lead Developer, specializing in full-stack development and user experience design.</li>
            <li><strong>Team Member 1:</strong> Backend Engineer, focused on database management and API integrations.</li>
            <li><strong>Team Member 2:</strong> Frontend Developer, ensuring a seamless and responsive user interface.</li>
            <li><strong>Team Member 3:</strong> UI/UX Designer, crafting intuitive designs that enhance user engagement.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Image Section */}
      <div className="text-center mb-8">
        <img
          src="/placeholder.svg"
          alt="Team working on sustainable cycling"
          className="mx-auto rounded-lg shadow-lg max-w-md"
        />
        <p className="mt-4 text-sm text-gray-600">Our team collaborating to build a sustainable future.</p>
      </div>

      {/* Developer Credit */}
      <div className="text-center">
        <p className="text-lg font-semibold">Developed by Shubham Gupta and team</p>
      </div>
    </div>
  );
};

export default About;
