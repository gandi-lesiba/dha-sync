import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { PlusIcon } from '@heroicons/react/24/outline';

const COLUMNS = [
  { id: 'order_issued', title: 'Order Issued', status: 'Order Issued', color: 'bg-blue-50 border-blue-300' },
  { id: 'detention', title: 'Detention', status: 'Detention', color: 'bg-yellow-50 border-yellow-300' },
  { id: 'travel_docs', title: 'Travel Docs', status: 'Travel Docs', color: 'bg-orange-50 border-orange-300' },
  { id: 'removal_confirmed', title: 'Removal Confirmed', status: 'Removal Confirmed', color: 'bg-green-50 border-green-300' },
];

export default function DeportationBoard() {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeportationCases();
  }, []);

  const fetchDeportationCases = async () => {
    setLoading(true);
    try {
      // Fetch only cases of type 'Deportation'
      const response = await api.get('/cases?case_type=Deportation');
      setCases(response.data.cases || []);
    } catch (error) {
      console.error('Failed to fetch deportation cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCasesByColumn = (columnId) => {
    const statusMap = {
      order_issued: 'Order Issued',
      detention: 'Detention',
      travel_docs: 'Travel Docs',
      removal_confirmed: 'Removal Confirmed',
    };
    return cases.filter(c => c.status === statusMap[columnId]);
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    const caseId = parseInt(draggableId);
    const newStatusMap = {
      order_issued: 'Order Issued',
      detention: 'Detention',
      travel_docs: 'Travel Docs',
      removal_confirmed: 'Removal Confirmed',
    };
    const newStatus = newStatusMap[destination.droppableId];
    if (!newStatus) return;

    // Optimistically update UI
    const updatedCases = cases.map(c =>
      c.id === caseId ? { ...c, status: newStatus } : c
    );
    setCases(updatedCases);

    // Send update to backend
    try {
      await api.put(`/cases/${caseId}`, { status: newStatus });
    } catch (error) {
      console.error('Failed to update case status:', error);
      // Revert on error
      fetchDeportationCases();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dha-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deportation Workflow Board</h1>
          <p className="text-sm text-gray-500">Track deportation cases through the pipeline</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-dha-blue-600 text-white rounded-lg hover:bg-dha-blue-700 transition">
          <PlusIcon className="w-5 h-5 mr-2" />
          New Deportation Order
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((column) => {
            const columnCases = getCasesByColumn(column.id);
            return (
              <div key={column.id} className={`rounded-xl border p-4 ${column.color}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">{column.title}</h3>
                  <span className="text-sm text-gray-500">{columnCases.length}</span>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[200px] space-y-2 transition-colors ${
                        snapshot.isDraggingOver ? 'bg-white/50 rounded-lg' : ''
                      }`}
                    >
                      {columnCases.map((caseItem, index) => (
                        <Draggable
                          key={caseItem.id}
                          draggableId={String(caseItem.id)}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white rounded-lg shadow-sm p-3 border border-gray-200 hover:shadow-md transition ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-800">
                                    {caseItem.case_number}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {caseItem.applicant_full_name}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs text-gray-400">
                                    {new Date(caseItem.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Stats Footer */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-800">{cases.length}</p>
            <p className="text-xs text-gray-500">Total Deportation Cases</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {cases.filter(c => c.status === 'Order Issued').length}
            </p>
            <p className="text-xs text-gray-500">Orders Issued</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">
              {cases.filter(c => c.status === 'Detention').length}
            </p>
            <p className="text-xs text-gray-500">In Detention</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {cases.filter(c => c.status === 'Removal Confirmed').length}
            </p>
            <p className="text-xs text-gray-500">Removal Confirmed</p>
          </div>
        </div>
      </div>
    </div>
  );
}