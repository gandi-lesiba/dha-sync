import React, { useState, useEffect } from "react";
import api from "../../api";

export default function Step2CaseDetails({ data, updateData }) {
    const [officers, setOfficers] = useState([]);  // ✅ Fixed: setOficers → setOfficers

    useEffect(() => {
        const fetchOfficers = async () => {  // ✅ Fixed: constfetchOfficers → const fetchOfficers
            try {
                const response = await api.get("/users");
                const filtered = response.data.filter(u => u.role === "Officer" || u.role === "Supervisor");
                setOfficers(filtered);
            } catch (error) {
                console.error("Failed to fetch officers:", error);
            }
        };
        fetchOfficers();
    }, []);  // ✅ Fixed: }) → }, )

    const handleChange = (e) => {
        const { name, value } = e.target;
        updateData({ [name]: value });
    };

    return (
       <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">Case Details</h2>
      <p className="text-sm text-gray-500">Specify the type and details of the case</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Case Type *</label>
          <select
            name="case_type"
            value={data.case_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dha-blue-500 focus:border-transparent outline-none"
            required
          >
            <option value="">Select case type...</option>
            <option value="Visa">Visa</option>
            <option value="Asylum">Asylum</option>
            <option value="Permit">Permit</option>
            <option value="Citizenship">Citizenship</option>
            <option value="Deportation">Deportation</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sub Type</label>
          <input
            type="text"
            name="sub_type"
            value={data.sub_type}
            onChange={handleChange}
            placeholder="e.g., Work Visa, Study Visa"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dha-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            name="priority"
            value={data.priority}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dha-blue-500 focus:border-transparent outline-none"
          >
            <option value="Normal">Normal</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assign Officer</label>
          <select
            name="assigned_officer_id"
            value={data.assigned_officer_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dha-blue-500 focus:border-transparent outline-none"
          >
            <option value="">Unassigned</option>
            {officers.map((officer) => (
              <option key={officer.id} value={officer.id}>
                {officer.full_name} ({officer.role})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Statutory Deadline (6-month rule)</label>
          <input
            type="date"
            name="statutory_deadline"
            value={data.statutory_deadline}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dha-blue-500 focus:border-transparent outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">Required for asylum cases - 6 months from application date</p>
        </div>
      </div>
    </div>
  );
}