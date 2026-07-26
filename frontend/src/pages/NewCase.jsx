import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api";

// step components
import Step1Applicant from "../components/registration/Step1Applicant";
import Step2CaseDetails from "../components/registration/Step2CaseDetails";
import Step3Documents from "../components/registration/Step3Documents";
import Step4Review from "../components/registration/Step4Review";

// Icons
import {
    UserIcon,
    DocumentTextIcon,
    PhotoIcon,
    CheckIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/outline";

const steps = [
    { number: 1, title: "Applicant Info", icon: UserIcon },
    { number: 2, title: "Case Details", icon: DocumentTextIcon },
    { number: 3, title: "Documents", icon: PhotoIcon },
    { number: 4, title: "Review & Submit", icon: CheckIcon },
];

export default function NewCase() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        // Step 1
        applicant_full_name: "",
        applicant_surname: "",
        applicant_given_names: "",
        passport_number: "",
        nationality: "",
        date_of_birth: "",
        gender: "",
        country_of_birth: "",
        national_id: "",  // ✅ Fixed: nantional_id → national_id
        // Step 2
        case_type: "",
        sub_type: "",
        reference_number: "",
        priority: "Normal",
        assigned_officer_id: "",
        statutory_deadline: "",  // ✅ Added missing field
        // Step 3
        documents: []
    });
    const [submitError, setSubmitError] = useState(null);

    // Which wizard step contains a given backend field, so a validation
    // error on submit can send the user back to fix it rather than leaving
    // them stuck on the review step with no obvious way to correct it.
    const FIELD_STEP = {
        applicant_full_name: 1, passport_number: 1, nationality: 1, date_of_birth: 1,
        case_type: 2, reference_number: 2,
    };

    // ✅ All these functions are now INSIDE the component
    const updateFormData = (data) => {
        setFormData((prev) => ({ ...prev, ...data }));
    };

    const nextStep = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setSubmitError(null);
        try {
            // Create case
            const response = await api.post("/cases", {
                ...formData,
                created_by_id: user.id
            });
            const caseId = response.data.id;

            // Upload documents if any
            for (const doc of formData.documents) {
                const formDataUpload = new FormData();
                formDataUpload.append("file", doc.file);  // ✅ Fixed: doc,file → doc.file
                formDataUpload.append("case_id", caseId);
                formDataUpload.append("document_type", doc.type);
                await api.post("/documents/upload", formDataUpload, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            navigate(`/cases/${caseId}`);
        } catch (error) {
            console.error("Failed to create case:", error);
            const data = error.response?.data;
            setSubmitError(data?.error || "Failed to create case. Please try again.");
            if (data?.field && FIELD_STEP[data.field]) {
                setCurrentStep(FIELD_STEP[data.field]);
                window.scrollTo(0, 0);
            }
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1Applicant data={formData} updateData={updateFormData} />;
            case 2:
                return <Step2CaseDetails data={formData} updateData={updateFormData} />;
            case 3:
                return <Step3Documents data={formData} updateData={updateFormData} />;
            case 4:
                return <Step4Review data={formData} />;
            default:
                return null;
        }
    };

    // ✅ The return statement is now INSIDE the component
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">  {/* ✅ Fixed: 4x1 → 4xl */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">New Case Registration</h1>  {/* ✅ Fixed: 2x1 → 2xl */}
                <p className="text-sm text-gray-500">Complete all steps to register a new immigration case</p>
            </div>

            {submitError && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{submitError}</p>
                </div>
            )}

            {/* Stepper */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                        const isActive = currentStep === step.number;
                        const isCompleted = currentStep > step.number;
                        return (
                            <React.Fragment key={step.number}>
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                            isCompleted
                                                ? "bg-green-500 text-white"  // ✅ Fixed: text white → text-white
                                                : isActive
                                                ? "bg-dha-blue-600 text-white ring-4 ring-dha-blue-200"
                                                : "bg-gray-200 text-gray-500"
                                        }`}
                                    >
                                        {isCompleted ? <CheckIcon className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                                    </div>
                                    <span className={`text-xs mt-1 ${isActive ? "text-dha-blue-600 font-semibold" : "text-gray-500"}`}>
                                        {step.title}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`flex-1 h-0.5 mx-2 ${currentStep > step.number ? "bg-green-500" : "bg-gray-200"}`}
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">  {/* ✅ Fixed: rounded-x1 → rounded-xl */}
                {renderStep()}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"  // ✅ Fixed: hover: bg-gray-50 → hover:bg-gray-50
                    >
                        <ChevronLeftIcon className="w-4 h-4 mr-1" />
                        Back
                    </button>
                    {currentStep === 4 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                            {loading ? "Submitting..." : (
                                <>
                                    <CheckIcon className="w-4 h-4 mr-2" />
                                    Submit Case
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={nextStep}
                            className="inline-flex items-center px-4 py-2 bg-dha-blue-600 text-white rounded-lg hover:bg-dha-blue-700 transition"
                        >
                            Next
                            <ChevronRightIcon className="w-4 h-4 ml-1" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}