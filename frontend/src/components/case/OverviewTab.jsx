import React from 'react';

export default function OverviewTab({ caseData }) {
  // Group fields into sections for better organization
  const sections = [
    {
      title: 'Case Information',
      fields: [
        { label: 'Case Number', value: caseData.case_number },
        { label: 'Case Type', value: caseData.case_type },
        { label: 'Sub Type', value: caseData.sub_type || 'N/A' },
        { label: 'Status', value: caseData.status },
        { label: 'Priority', value: caseData.priority },
      ],
    },
    {
      title: 'Applicant Information',
      fields: [
        { label: 'Full Name', value: caseData.applicant_full_name },
        { label: 'Passport Number', value: caseData.passport_number },
        { label: 'Nationality', value: caseData.nationality },
        { label: 'Date of Birth', value: caseData.date_of_birth ? new Date(caseData.date_of_birth).toLocaleDateString() : 'N/A' },
      ],
    },
    {
      title: 'Assignment & Dates',
      fields: [
        { label: 'Assigned Officer', value: caseData.assigned_officer_name || 'Unassigned' },
        { label: 'Created Date', value: new Date(caseData.created_at).toLocaleString() },
        { label: 'Statutory Deadline', value: caseData.statutory_deadline ? new Date(caseData.statutory_deadline).toLocaleDateString() : 'N/A' },
        { label: 'Decision Date', value: caseData.decision_date ? new Date(caseData.decision_date).toLocaleDateString() : 'Pending' },
      ],
    },
  ];

  // Status color mapping
  const statusColors = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Under Review': 'bg-blue-100 text-blue-800',
    'Approved': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Appeals': 'bg-purple-100 text-purple-800',
    'Interview Scheduled': 'bg-indigo-100 text-indigo-800',
  };

  // Priority color mapping
  const priorityColors = {
    'Normal': 'bg-gray-100 text-gray-800',
    'High': 'bg-orange-100 text-orange-800',
    'Urgent': 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      {/* Status and Priority Badges */}
      <div className="flex items-center space-x-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[caseData.status] || 'bg-gray-100 text-gray-800'}`}>
          {caseData.status || 'Pending'}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[caseData.priority] || 'bg-gray-100 text-gray-800'}`}>
          {caseData.priority || 'Normal'}
        </span>
      </div>

      {/* Field Sections */}
      {sections.map((section, idx) => (
        <div key={idx} className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
            {section.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {section.fields.map((field, index) => (
              <div key={index}>
                <p className="text-xs text-gray-400 font-medium">{field.label}</p>
                <p className="text-sm text-gray-800 font-medium mt-0.5">{field.value}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}