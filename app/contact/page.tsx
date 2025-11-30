export default function ContactPage() {
  return (
    <div className="max-w-xl mx-auto mt-16 px-6 text-center">
      <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
        Contact Us
      </h1>

      <p className="text-lg text-gray-300 mb-8">
        Have questions, feedback, or business enquiries?  
        We’d love to hear from you.
      </p>

      <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6 shadow-xl">
        <h2 className="text-2xl font-semibold text-indigo-300 mb-4">Email</h2>
        <p className="text-gray-300 text-lg">
          ghostaicorp@gmail.com
          
        </p>
      </div>

      <p className="text-gray-400 mt-10">
        We aim to reply within 24–48 hours.
      </p>
    </div>
  );
}
