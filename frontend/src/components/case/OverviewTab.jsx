import React from 'react';

export default function OverviewTab({ caseData }) {
  const fields = [
    { label: 'Case Number', value: caseData.case_number },
    { label: 'Case Type', value: caseData.case_type },
    { label: 'Sub Type', value: caseData.sub_type || 'N/A' },
    { label: 'Status', value: caseData.status },
    { label: 'Priority', value: caseData.priority },
    { label: 'Applicant', value: caseData.applicant_full_name },
    { label: 'Passport', value: caseData.passport_number },
    { label: 'Nationality', value: caseData.nationality },
    { label: 'Date of Birth', value: caseData.date_of_birth ? new Date(caseData.date_of_birth).toLocaleDateString() : 'N/A' },
    { label: 'Assigned Officer', value: caseData.assigned_officer_name || 'Unassigned' },
    { label: 'Created', value: new Date(caseData.created_at).toLocaleString() },
    { label: 'Deadline', value: caseData.statutory_deadline ? new Date(caseData.statutory_deadline).toLocaleDateString() : 'N/A' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.map((field, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-400">{field.label}</p>
            <p className="text-sm font-medium text-gray-800">{field.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}