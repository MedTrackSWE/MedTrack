import React, { useState, useEffect } from 'react';

const FAQPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize Bootstrap components after the component mounts
  useEffect(() => {
    // This ensures Bootstrap's JavaScript runs after the DOM is ready
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/js/bootstrap.bundle.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const faqData = [
    {
      id: 1,
      category: 'appointments',
      question: 'How do I schedule an appointment?',
      answer: 'You can schedule an appointment through our online portal by clicking the "Schedule Appointment" button. Select your preferred hospital, date, and available time slot. You can also call our helpline for assistance.'
    },
    {
      id: 2,
      category: 'appointments',
      question: 'How can I cancel or reschedule my appointment?',
      answer: 'To cancel or reschedule, go to "Upcoming Appointments" in your dashboard. You can either click "Cancel Appointment" or "Reschedule Appointment". Please note that we require at least 24 hours notice for cancellations.'
    },
    {
      id: 3,
      category: 'general',
      question: 'What should I bring to my appointment?',
      answer: 'Please bring a valid photo ID, your insurance card, a list of current medications, and any relevant medical records or test results. If this is your first visit, please arrive 15 minutes early to complete registration.'
    },
    {
      id: 4,
      category: 'insurance',
      question: 'What insurance plans do you accept?',
      answer: 'We accept most major insurance plans including Medicare and Medicaid. Please contact our billing department or check with your insurance provider to verify coverage for specific procedures.'
    },
    {
      id: 5,
      category: 'appointments',
      question: 'How early should I arrive for my appointment?',
      answer: 'Please arrive 15 minutes before your scheduled appointment time. For first-time visits, we recommend arriving 30 minutes early to complete necessary paperwork.'
    },
    {
      id: 6,
      category: 'general',
      question: 'What are your operating hours?',
      answer: 'Our standard operating hours are Monday to Friday, 8:00 AM to 6:00 PM. Some locations offer extended hours and weekend appointments. Please check with your specific location for exact timings.'
    },
    {
      id: 7,
      category: 'insurance',
      question: 'Do you offer payment plans?',
      answer: 'Yes, we offer flexible payment plans for patients who qualify. Please discuss with our billing department to learn more about our payment options and financial assistance programs.'
    },
    {
      id: 8,
      category: 'general',
      question: 'How do I access my medical records?',
      answer: 'You can access your medical records through our patient portal. For printed copies, please submit a written request to our medical records department. Processing may take 5-7 business days.'
    }
  ];

  const categories = ['all', ...new Set(faqData.map(item => item.category))];

  const handleBackToDashboard = () => {
    window.location.href = '/dashboard';
  };

  const filteredFAQs = faqData
    .filter(faq => 
      (activeCategory === 'all' || faq.category === activeCategory) &&
      (searchQuery === '' || 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <div className="container mt-5">
      {/* Bootstrap CSS */}
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css"
        rel="stylesheet"
      />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Frequently Asked Questions</h1>
        <button className="btn btn-secondary" onClick={handleBackToDashboard}>
          Back to Dashboard
        </button>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="btn btn-outline-secondary"
                onClick={() => setSearchQuery('')}
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="d-flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                className={`btn ${
                  activeCategory === category ? 'btn-primary' : 'btn-outline-primary'
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredFAQs.length === 0 ? (
        <div className="alert alert-info">
          No FAQs found matching your search criteria.
        </div>
      ) : (
        <div className="accordion" id="faqAccordion">
          {filteredFAQs.map((faq) => (
            <div className="accordion-item" key={faq.id}>
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#faq-${faq.id}`}
                  aria-expanded="false"
                  aria-controls={`faq-${faq.id}`}
                >
                  {faq.question}
                  <span className="badge bg-primary ms-2">
                    {faq.category}
                  </span>
                </button>
              </h2>
              <div
                id={`faq-${faq.id}`}
                className="accordion-collapse collapse"
                data-bs-parent="#faqAccordion"
              >
                <div className="accordion-body">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 mb-4 p-4 bg-light rounded">
        <h3>Can't find what you're looking for?</h3>
        <p className="mb-3">
          If you couldn't find the answer to your question, please don't hesitate to contact us:
        </p>
        <div className="d-flex gap-3">
          <button className="btn btn-primary">
            Contact Support
          </button>
          <button className="btn btn-outline-primary">
            Call Us: 1-800-HEALTH
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;