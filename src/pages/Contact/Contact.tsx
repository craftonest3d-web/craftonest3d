/**
 * CRAFTONEST3D – Contact Page
 * Sections: Hero → Contact Info Cards → WhatsApp Banner → Map + Form
 */
import React, { useState } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiSend, FiMessageSquare } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useSiteSettings } from '../../hooks/useSiteSettings';

interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const INITIAL_FORM: FormState = { name: '', email: '', phone: '', subject: '', message: '' };

export const Contact: React.FC = () => {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { storePhone, storeEmail, whatsappNumber, contactHeading, contactSubheading } = useSiteSettings();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate async submit
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setForm(INITIAL_FORM);
    }, 800);
  };

  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi CRAFTONEST3D! I'd like to get in touch. My name is ${form.name || '...'}.`)}`;

  const INFO_CARDS = [
    {
      icon: <FiPhone size={20} />,
      title: 'Call Us',
      content: storePhone,
      sub: 'Mon – Sat: 10 AM – 8 PM',
      href: `tel:${storePhone.replace(/\s/g, '')}`,
    },
    {
      icon: <FiMail size={20} />,
      title: 'Email Us',
      content: storeEmail,
      sub: 'We reply within 24 hours',
      href: `mailto:${storeEmail}`,
    },
    {
      icon: <FaWhatsapp size={20} />,
      title: 'WhatsApp',
      content: storePhone,
      sub: 'Quickest way to reach us',
      href: `https://wa.me/${whatsappNumber}`,
    },
  ];

  return (
    <>
      {/* ── Page Hero ────────────────────────────────── */}
      <div className="page-hero" aria-label="Contact page header">
        <Container>
          <div className="text-center">
            <h1 className="fw-bold mb-2" style={{ fontSize: '2.25rem', color: 'var(--pn-text-dark)' }}>{contactHeading}</h1>
            <p className="mb-0" style={{ maxWidth: 520, margin: '0 auto', fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--pn-text-muted)' }}>
              {contactSubheading}
            </p>
            <nav aria-label="Breadcrumb" className="mt-3">
              <ol className="breadcrumb justify-content-center mb-0" style={{ fontSize: '0.82rem' }}>
                <li className="breadcrumb-item"><Link to="/" style={{ color: 'var(--pn-text-muted)' }}>Home</Link></li>
                <li className="breadcrumb-item active" style={{ color: 'var(--pn-text-muted)' }}>Contact</li>
              </ol>
            </nav>
          </div>
        </Container>
      </div>

      {/* ── Contact Info Cards ────────────────────────── */}
      <section className="py-5" style={{ backgroundColor: 'var(--pn-bg-paper)' }} aria-label="Contact information">
        <Container>
          <Row className="g-4 mb-5">
            {INFO_CARDS.map((card, i) => (
              <Col xs={12} sm={6} lg={3} key={i}>
                <a
                  href={card.href}
                  target={card.href.startsWith('http') ? '_blank' : undefined}
                  rel={card.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="text-decoration-none d-block"
                >
                  <div className="contact-info-card flex-column text-center align-items-center">
                    <div
                      className="contact-icon-wrap mb-3"
                      style={{ width: 52, height: 52, borderRadius: 12, margin: '0 auto' }}
                      aria-hidden="true"
                    >
                      {card.icon}
                    </div>
                    <h6 className="fw-bold mb-1" style={{ fontSize: '0.925rem', color: 'var(--pn-text-dark)' }}>
                      {card.title}
                    </h6>
                    <p className="mb-1" style={{ fontSize: '0.875rem', color: 'var(--pn-text-dark)', fontWeight: 500, wordBreak: 'break-word' }}>
                      {card.content}
                    </p>
                    <p className="mb-0" style={{ fontSize: '0.78rem', color: 'var(--pn-text-muted)' }}>{card.sub}</p>
                  </div>
                </a>
              </Col>
            ))}
          </Row>

          {/* ── WhatsApp Banner ──────────────────────────── */}
          <div
            className="rounded-4 p-4 mb-5 d-flex flex-column flex-md-row align-items-center justify-content-between gap-4"
            style={{ backgroundColor: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)' }}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{ width: 56, height: 56, backgroundColor: '#25D366', color: 'white', flexShrink: 0 }}
                aria-hidden="true"
              >
                <FaWhatsapp size={28} />
              </div>
              <div>
                <h5 className="fw-bold mb-1" style={{ fontSize: '1.1rem', color: 'var(--pn-text-dark)' }}>
                  Prefer WhatsApp?
                </h5>
                <p className="mb-0" style={{ fontSize: '0.875rem', color: 'var(--pn-text-muted)' }}>
                  Chat with us directly for the fastest response. Share your idea, get a quote, discuss details.
                </p>
              </div>
            </div>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi CRAFTONEST3D! I have a 3D printing enquiry.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn px-4 py-2 fw-bold rounded-3 d-flex align-items-center gap-2"
              style={{ backgroundColor: '#25D366', color: 'white', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              <FaWhatsapp size={18} /> Chat on WhatsApp
            </a>
          </div>

          {/* ── Contact Form (full width) ────────────── */}
          <Row className="g-5">
            <Col lg={8} className="mx-auto">
              <h2 className="section-title mb-4" style={{ fontSize: '1.5rem', color: 'var(--pn-text-dark)' }}>
                <FiMessageSquare size={22} className="me-2" style={{ color: 'var(--pn-primary)' }} />
                Send Us a Message
              </h2>

              {submitted ? (
                <div
                  className="rounded-4 p-5 text-center"
                  style={{ backgroundColor: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)' }}
                >
                  <FiSend size={40} style={{ color: '#25D366' }} className="mb-3" />
                  <h4 className="fw-bold mb-2" style={{ color: 'var(--pn-text-dark)' }}>Message Sent Successfully!</h4>
                  <p className="mb-4" style={{ color: 'var(--pn-text-muted)' }}>
                    Thank you for reaching out. We'll get back to you soon.
                  </p>
                  <button className="btn btn-pink" onClick={() => setSubmitted(false)}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <Form
                  onSubmit={handleSubmit}
                  className="p-4 rounded-4"
                  style={{ backgroundColor: 'var(--pn-bg-pink-light)', border: '1px solid #2a2a2a' }}
                  noValidate
                >
                  <Row className="g-3">
                    <Col sm={6}>
                      <Form.Group controlId="contactName">
                        <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem', color: 'var(--pn-text-dark)' }}>
                          Your Name <span style={{ color: 'var(--pn-primary)' }}>*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          placeholder="Your name"
                          value={form.name}
                          onChange={handleChange}
                          required
                          style={{ height: 44 }}
                        />
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      <Form.Group controlId="contactEmail">
                        <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem', color: 'var(--pn-text-dark)' }}>
                          Email Address <span style={{ color: 'var(--pn-primary)' }}>*</span>
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={handleChange}
                          required
                          style={{ height: 44 }}
                        />
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      <Form.Group controlId="contactPhone">
                        <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem', color: 'var(--pn-text-dark)' }}>
                          Phone Number
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          placeholder="+91 98765 43210"
                          value={form.phone}
                          onChange={handleChange}
                          style={{ height: 44 }}
                        />
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      <Form.Group controlId="contactSubject">
                        <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem', color: 'var(--pn-text-dark)' }}>
                          Subject
                        </Form.Label>
                        <Form.Select
                          name="subject"
                          value={form.subject}
                          onChange={handleChange}
                          style={{ height: 44 }}
                          aria-label="Select subject"
                        >
                          <option value="">Select a topic…</option>
                          <option value="Custom Order">Custom 3D Print Order</option>
                          <option value="Personalized">Personalized Product</option>
                          <option value="Prototype">Prototype Enquiry</option>
                          <option value="Bulk">Bulk / Multiple Prints</option>
                          <option value="Quote">Get a Quote</option>
                          <option value="Other">Other</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col xs={12}>
                      <Form.Group controlId="contactMessage">
                        <Form.Label className="fw-semibold" style={{ fontSize: '0.875rem', color: 'var(--pn-text-dark)' }}>
                          Message <span style={{ color: 'var(--pn-primary)' }}>*</span>
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          name="message"
                          placeholder="Tell us about your idea — what would you like to 3D print?"
                          value={form.message}
                          onChange={handleChange}
                          required
                          style={{ resize: 'vertical', minHeight: 110 }}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12}>
                      <button
                        type="submit"
                        className="btn btn-pink w-100 d-flex align-items-center justify-content-center gap-2"
                        disabled={submitting}
                        style={{ height: 48, fontSize: '0.9rem' }}
                      >
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                            Sending…
                          </>
                        ) : (
                          <>
                            <FiSend size={16} /> Send Message
                          </>
                        )}
                      </button>
                    </Col>
                  </Row>
                </Form>
              )}
            </Col>
          </Row>
        </Container>
      </section>

      {/* ── Floating WhatsApp ──────────────────────────── */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp size={26} />
      </a>
    </>
  );
};

export default Contact;
