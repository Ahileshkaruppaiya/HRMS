import React, { useState, useEffect } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { 
  ListTodo, 
  UserCheck, 
  Users, 
  PlusCircle, 
  Plus,
  Settings2, 
  BarChart3, 
  CheckSquare,
  Sparkles
} from 'lucide-react';

import { TaskRegister } from './TaskRegister';
import { NewTaskForm } from './NewTaskForm';
import { MyTasks } from './MyTasks';
import { TeamTasks } from './TeamTasks';
import { TaskDetailModal } from './TaskDetailModal';
import { TaskMasters } from './TaskMasters';
import { TaskReports } from './TaskReports';

interface TaskManagementProps {
  openAddModal?: boolean;
  onCloseQuickAdd?: () => void;
}

export const TaskManagement: React.FC<TaskManagementProps> = ({ openAddModal, onCloseQuickAdd }) => {
  const { currentUser, enhancedTasks } = useHRMS();

  // Active Tab State - defaults to Task Register
  const [activeTab, setActiveTab] = useState<
    'register' | 'my_tasks' | 'team_tasks' | 'new_task' | 'masters' | 'reports'
  >('register');

  // Selected Task for Detail Modal
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // If user opened via quick add modal trigger
  useEffect(() => {
    if (openAddModal) {
      setActiveTab('new_task');
    }
  }, [openAddModal]);

  const isEmployee = currentUser.role === 'Employee' || currentUser.role === 'Assignee';

  const handleTaskCreated = (newTaskId: string) => {
    setSelectedTaskId(newTaskId);
    setActiveTab('register');
    if (onCloseQuickAdd) onCloseQuickAdd();
  };

  const handleCancelCreate = () => {
    setActiveTab('register');
    if (onCloseQuickAdd) onCloseQuickAdd();
  };

  // Count my tasks
  const myTasksCount = enhancedTasks.filter(t => 
    t.assignees.some(a => a.employeeId === (currentUser.employeeId || 'EMP-001')) &&
    t.overallStatus !== 'COMPLETED' && t.overallStatus !== 'CLOSED'
  ).length;

  return (
    <div className="task-management-module" style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
      {/* Standard Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Task Management</h1>
          <p className="page-subtitle">
            Assign, track, and monitor department deliverables, MOM action items, and task completion progress
          </p>
        </div>
        <div className="header-actions">
          {activeTab === 'new_task' ? (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('register')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              <ListTodo size={16} /> Task Register
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setActiveTab('new_task')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              <Plus size={16} /> New Task
            </button>
          )}
        </div>
      </div>

      {/* Top Module Navigation Bar */}
      <div style={{ 
        padding: '8px 16px', 
        marginBottom: '20px', 
        borderRadius: '14px', 
        background: '#ffffff',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'register', label: 'Task Register', icon: ListTodo },
              { id: 'my_tasks', label: 'My Tasks', icon: UserCheck, badge: myTasksCount },
              { id: 'team_tasks', label: 'Team Tasks', icon: Users },
              { id: 'reports', label: 'Reports', icon: BarChart3 },
              { id: 'masters', label: 'Masters', icon: Settings2, hidden: isEmployee }
            ].filter(t => !t.hidden).map(t => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;

              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  style={{ 
                    fontSize: '0.82rem', 
                    padding: '8px 16px', 
                    borderRadius: '10px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '7px',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: isActive ? '1px solid #0E7490' : '1px solid transparent',
                    background: isActive ? '#0E7490' : 'transparent',
                    color: isActive ? '#ffffff' : '#475569',
                    boxShadow: isActive ? '0 2px 6px rgba(14, 116, 144, 0.25)' : 'none'
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#F8FAFC';
                      e.currentTarget.style.color = '#1E293B';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#475569';
                    }
                  }}
                >
                  <Icon size={16} />
                  <span>{t.label}</span>
                  {t.badge !== undefined && t.badge > 0 && (
                    <span style={{ 
                      background: isActive ? 'rgba(255, 255, 255, 0.25)' : '#EF4444', 
                      color: '#ffffff', 
                      fontSize: '0.7rem', 
                      fontWeight: 700, 
                      padding: '1px 7px', 
                      borderRadius: '9999px',
                      marginLeft: '2px'
                    }}>
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sub-View Dispatcher */}
      {activeTab === 'register' && (
        <TaskRegister 
          onSelectTask={(id) => setSelectedTaskId(id)}
          onOpenNewTask={() => setActiveTab('new_task')}
        />
      )}

      {activeTab === 'my_tasks' && (
        <MyTasks 
          onSelectTask={(id) => setSelectedTaskId(id)}
        />
      )}

      {activeTab === 'team_tasks' && (
        <TeamTasks 
          onSelectTask={(id) => setSelectedTaskId(id)}
        />
      )}

      {activeTab === 'new_task' && (
        <NewTaskForm 
          onTaskCreated={handleTaskCreated}
          onCancel={handleCancelCreate}
        />
      )}

      {activeTab === 'masters' && (
        <TaskMasters />
      )}

      {activeTab === 'reports' && (
        <TaskReports />
      )}

      {/* Deep 8-Tab Task Detail Modal */}
      {selectedTaskId && (
        <TaskDetailModal 
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
};
