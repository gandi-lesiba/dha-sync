import React from "react";
import { CheckCircleIcon, UserIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

export default function Step4Review({ data }) {
    const sections = [
        {
            title: "Applicant Information",
            icon: UserIcon,
            fields: [
                { label: "Full Name", value: data.applicant_full_name },
                { label: "Passport Number", value: data.passport_number },
                { label: "Nationality", value: data.nationality },
                { label: "Date of Birth", value: data.date_of_birth },
                { label: "Gender", value: data.gender || "Not specified" },
            ],
        },
        {
            title: "Case Details",
            icon: DocumentTextIcon,
            fields: [
                { label: "Case Type", value: data.case_type },
                { label: "Sub Type", value: data.sub_type || "N/A" },
                { label: "Priority", value: data.priority },
                { label: "Statutory Deadline", value: data.statutory_deadline || "N/A" },
                { label: "Assigned Officer", value: data.assigned_officer_id ? "Assigned" : "Unassigned" },
            ],
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-6 h-6 text-green-500" />
                <h2 className="text-lg font-semibold text-gray-800">Review & Submit</h2>
            </div>
            <p className="text-sm text-gray-500">Please review all information before submitting</p>

            {sections.map((section, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                        <section.icon className="w-5 h-5 text-dha-blue-600" />
                        <h3 className="font-medium text-gray-800">{section.title}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {section.fields.map((field, idx) => (
                            <div key={idx} className="flex items-center justify-between py-1 border-b border-gray-200 last:border-0">
                                <span className="text-sm text-gray-500">{field.label}</span>
                                <span className="text-sm font-medium text-gray-800">{field.value || "Not provided"}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2">Documents</h3>
                {data.documents.length === 0 ? (
                    <p className="text-sm text-gray-400">No documents uploaded</p>
                ) : (
                    <ul className="space-y-1">
                        {data.documents.map((doc, idx) => (
                            <li key={idx} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{doc.name}</span>
                                <span className="text-gray-400">{doc.type}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                    <span className="font-semibold">Ready to submit?</span> Once submitted, this case will be reviewed by the assigned officer.
                </p>
            </div>
        </div>
    );
}