"use client"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../Accordion"

const faqs = [
  {
    question: "Who can submit ideas on the platform?",
    answer:
      "Anyone with a creative spark! Whether you’re a student, professional, or hobbyist, you can share your ideas and get feedback from the community.",
  },
  {
    question: "Can I submit multiple ideas?",
    answer:
      "Absolutely! The more ideas, the merrier. You can submit as many concepts as you like and track their progress separately.",
  },
  {
    question: "How do I know if my idea is being considered?",
    answer:
      "Once submitted, your idea will be visible to the review team and other collaborators. You’ll get updates on its status, feedback, and any next steps.",
  },
  {
    question: "Is my idea private or public?",
    answer:
      "You can choose! Keep it private while refining it, or share it with the community for early feedback and collaboration.",
  },
  {
    question: "What kind of support can I expect?",
    answer:
      "We offer guidance on idea submission, review processes, and connecting with mentors. Our goal is to help you turn concepts into real projects.",
  },
]

export function Faqs() {
  return (
    <section className="mt-20 sm:mt-36" aria-labelledby="faq-title">
      <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-14">
        <div className="col-span-full sm:col-span-5">
          <h2
            id="faq-title"
            className="inline-block scroll-my-24 bg-gradient-to-br from-gray-900 to-gray-800 bg-clip-text py-2 pr-2 text-2xl font-bold tracking-tighter text-transparent lg:text-3xl dark:from-gray-50 dark:to-gray-300"
          >
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-400">
            Have a question we didn’t cover? Reach out to our{" "}
            <a
              href="#"
              className="font-medium text-indigo-600 hover:text-indigo-300 dark:text-indigo-400"
            >
              support team
            </a>{" "}
            and we’ll guide you through the process.
          </p>
        </div>
        <div className="col-span-full mt-6 lg:col-span-7 lg:mt-0">
          <Accordion type="multiple" className="mx-auto">
            {faqs.map((item) => (
              <AccordionItem
                value={item.question}
                key={item.question}
                className="py-3 first:pb-3 first:pt-0"
              >
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
