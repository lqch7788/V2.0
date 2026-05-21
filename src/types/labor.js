// 考勤状态
export const AttendanceStatus = {
  NORMAL: 'normal',
  LATE: 'late',
  LEAVE: 'leave',
  ABSENT: 'absent',
  EARLY: 'early'
}

// 考勤记录
export const AttendanceRecord = {
  id: 0,
  userId: 0,
  userName: '',
  department: '',
  date: '',
  checkInTime: '',
  checkOutTime: '',
  status: 'normal',
  remark: ''
}

// 人员信息
export const Worker = {
  id: 0,
  name: '',
  phone: '',
  idCard: '',
  department: '',
  position: '',
  type: 'permanent',
  status: 'active',
  joinDate: '',
  leaveDate: ''
}

// 请假记录
export const LeaveRecord = {
  id: 0,
  userId: 0,
  userName: '',
  leaveType: 'annual',
  startDate: '',
  endDate: '',
  days: 0,
  reason: '',
  status: 'pending',
  approver: '',
  approvedAt: ''
}
