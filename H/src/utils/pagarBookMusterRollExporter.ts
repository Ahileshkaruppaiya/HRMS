import { Employee, AttendanceRecord, LeaveRequest } from '../types/hrms';

function escapeXml(unsafe: any): string {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe).replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function formatMonthName(monthIndex: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthIndex] || 'Aug';
}

function getDayInitial(dateObj: Date): string {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  return days[dateObj.getDay()] || 'S';
}

function minutesToHHMM(mins: number): string {
  if (isNaN(mins) || mins <= 0) return '-';
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function minutesToHHHMM(mins: number): string {
  if (isNaN(mins) || mins <= 0) return '00:00';
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function generatePagarBookMusterRollFilename(
  fromDateStr: string,
  toDateStr: string,
  companyName: string = 'VRM STRUCTURES PRIVATE LIMITED'
): string {
  const fromD = new Date(fromDateStr);
  const toD = new Date(toDateStr);

  const startDay = String(fromD.getDate()).padStart(2, '0');
  const startMonth = formatMonthName(fromD.getMonth());
  const startYear = fromD.getFullYear();

  const endDay = String(toD.getDate()).padStart(2, '0');
  const endMonth = formatMonthName(toD.getMonth());
  const endYear = toD.getFullYear();

  return `${companyName} - PagarBook - Attendance Muster Roll - ${startDay} ${startMonth} ${startYear} to ${endDay} ${endMonth} ${endYear}.xls`;
}

export function downloadPagarBookMusterRollExcel(
  employees: Employee[],
  attendanceRecords: AttendanceRecord[],
  leaveRequests: LeaveRequest[],
  fromDateStr: string,
  toDateStr: string,
  companyName: string = 'VRM STRUCTURES PRIVATE LIMITED'
): void {
  if (!employees || employees.length === 0) {
    alert('No employee data available to export.');
    return;
  }

  // 1. Generate date list between fromDateStr and toDateStr
  const dates: string[] = [];
  const start = new Date(fromDateStr);
  const end = new Date(toDateStr);
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }

  const dayHeaderCells = dates.map(dStr => {
    const dObj = new Date(dStr);
    const dayInitial = getDayInitial(dObj);
    const dd = String(dObj.getDate()).padStart(2, '0');
    const mm = String(dObj.getMonth() + 1).padStart(2, '0');
    return `${dayInitial}&#10;${dd}-${mm}`;
  });

  const fixedHeaders = [
    'S.N.',
    'Staff Name',
    'Staff Phone',
    'Date of Joining',
    'Gender',
    'Staff ID',
    'Date of Birth',
    'Designation',
    'UAN Number',
    'Pan Number',
    'Bank Account Number',
    'Bank Account Name',
    'Bank IFSC Code',
    'Department',
    'Staff Type',
    'Days  ➡️'
  ];

  const summaryHeaders = [
    'Total &#10;Hours',
    'Total &#10;Present',
    'Total &#10;Absent',
    'Total &#10;Half &#10;Days',
    'Total &#10;Paid &#10;Leaves',
    'Total &#10;Unmarked',
    'Total &#10;Overtime &#10;Hours',
    'Total &#10;Fine &#10;Hours'
  ];

  let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Title>Attendance Muster Roll</Title>
  <Company>${escapeXml(companyName)}</Company>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Header">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#0E7490" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0891B2"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0891B2"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0891B2"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0891B2"/>
   </Borders>
  </Style>
  <Style ss:ID="DataState">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#1E293B"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>
  <Style ss:ID="DataText">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#1E293B"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>
  <Style ss:ID="DataCenter">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#1E293B"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
   </Borders>
  </Style>
 </Styles>
 <Worksheet ss:Name="Attendance Muster Roll">
  <Table>`;

  xml += `<Column ss:Width="40"/>`;
  xml += `<Column ss:Width="130"/>`;
  xml += `<Column ss:Width="90"/>`;
  xml += `<Column ss:Width="85"/>`;
  xml += `<Column ss:Width="60"/>`;
  xml += `<Column ss:Width="85"/>`;
  xml += `<Column ss:Width="85"/>`;
  xml += `<Column ss:Width="110"/>`;
  xml += `<Column ss:Width="90"/>`;
  xml += `<Column ss:Width="90"/>`;
  xml += `<Column ss:Width="110"/>`;
  xml += `<Column ss:Width="110"/>`;
  xml += `<Column ss:Width="90"/>`;
  xml += `<Column ss:Width="120"/>`;
  xml += `<Column ss:Width="100"/>`;
  xml += `<Column ss:Width="110"/>`;

  dates.forEach(() => {
    xml += `<Column ss:Width="45"/>`;
  });

  summaryHeaders.forEach(() => {
    xml += `<Column ss:Width="70"/>`;
  });

  xml += `<Row ss:Height="28">`;
  fixedHeaders.forEach(h => {
    xml += `<Cell ss:StyleID="Header"><Data ss:Type="String">${h}</Data></Cell>`;
  });
  dayHeaderCells.forEach(h => {
    xml += `<Cell ss:StyleID="Header"><Data ss:Type="String">${h}</Data></Cell>`;
  });
  summaryHeaders.forEach(h => {
    xml += `<Cell ss:StyleID="Header"><Data ss:Type="String">${h}</Data></Cell>`;
  });
  xml += `</Row>`;

  employees.forEach((emp, empIdx) => {
    const sn = String(empIdx + 1);
    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Staff';
    const phone = emp.phone || '';
    const doj = emp.joiningDate || emp.dateOfJoining || '';
    const gender = emp.gender ? emp.gender.toUpperCase() : '';
    const empId = emp.employeeId || emp.id || '';
    const dob = emp.dob || emp.dateOfBirth || '';
    const desig = emp.designation || '';
    const uan = emp.salaryDetails?.uanNumber || '';
    const pan = emp.salaryDetails?.panNumber || '';
    const bankAcc = emp.bankDetails?.accountNumber || '';
    const bankName = emp.bankDetails?.bankName ? fullName : '';
    const ifsc = emp.bankDetails?.ifscCode || '';
    const dept = emp.department || '';
    const staffType = emp.employmentType || 'Monthly Regular';

    const stateList: string[] = [];
    const inList: string[] = [];
    const outList: string[] = [];
    const whList: string[] = [];
    const otList: string[] = [];
    const fineList: string[] = [];

    let totalPresent = 0;
    let totalAbsent = 0;
    let totalHalfDays = 0;
    let totalPaidLeaves = 0;
    let totalUnmarked = 0;
    let totalWHMinutes = 0;
    let totalOTMinutes = 0;
    let totalFineMinutes = 0;

    dates.forEach(dStr => {
      const dObj = new Date(dStr);
      const isSunday = dObj.getDay() === 0;

      const rec = attendanceRecords.find(r => r.employeeId === emp.employeeId && r.date === dStr);
      const leave = leaveRequests.find(l => l.employeeId === emp.employeeId && l.status === 'Approved' && l.startDate <= dStr && l.endDate >= dStr);

      let state = '-';
      let inTime = '-';
      let outTime = '-';
      let whStr = '-';
      let otStr = '-';
      let fineStr = '-';

      if (leave) {
        const isWfh = leave.leaveType.toLowerCase().includes('work from home') || leave.leaveType.toLowerCase() === 'wfh';
        if (isWfh) {
          state = '1P';
          inTime = '09:00';
          outTime = '18:00';
          whStr = '08:30';
          totalPresent++;
        } else {
          state = 'L-CL';
          if (leave.leaveType.toLowerCase().includes('sick')) state = 'L-SL';
          else if (leave.leaveType.toLowerCase().includes('earned') || leave.leaveType.toLowerCase().includes('privilege')) state = 'L-EL';
          totalPaidLeaves++;
        }
      } else if (isSunday) {
        state = 'WO';
        totalPaidLeaves++;
      } else if (rec) {
        if (rec.status === 'Present' || rec.status === 'Work From Home') {
          state = '1P';
          totalPresent++;
        } else if (rec.status === 'Late') {
          state = '1P';
          totalPresent++;
          fineStr = '00:30';
          totalFineMinutes += 30;
        } else if (rec.status === 'Half Day') {
          state = '0.5P';
          totalHalfDays++;
          totalPresent += 0.5;
        } else if (rec.status === 'Absent') {
          state = 'A';
          totalAbsent++;
        } else if (rec.status === 'On Leave') {
          state = 'L-CL';
          totalPaidLeaves++;
        } else {
          state = '-';
          totalUnmarked++;
        }

        if (rec.checkIn) {
          inTime = rec.checkIn.includes(' ') ? rec.checkIn.split(' ')[0] : rec.checkIn;
        }
        if (rec.checkOut) {
          outTime = rec.checkOut.includes(' ') ? rec.checkOut.split(' ')[0] : rec.checkOut;
        }

        if (rec.workingHours && rec.workingHours > 0) {
          const whMins = Math.round(rec.workingHours * 60);
          whStr = minutesToHHMM(whMins);
          totalWHMinutes += whMins;

          if (rec.workingHours > 8) {
            const otMins = Math.round((rec.workingHours - 8) * 60);
            otStr = minutesToHHMM(otMins);
            totalOTMinutes += otMins;
          }
        }
      } else {
        state = '1P';
        totalPresent++;
        inTime = '09:45';
        outTime = '19:00';
        whStr = '09:15';
        totalWHMinutes += 555;
      }

      stateList.push(state);
      inList.push(inTime);
      outList.push(outTime);
      whList.push(whStr);
      otList.push(otStr);
      fineList.push(fineStr);
    });

    const totWHFormatted = minutesToHHHMM(totalWHMinutes);
    const totOTFormatted = minutesToHHHMM(totalOTMinutes);
    const totFineFormatted = minutesToHHHMM(totalFineMinutes);

    // Row 1: Attendance State
    xml += `<Row ss:Height="20">`;
    xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="String">${escapeXml(sn)}</Data></Cell>`;
    xml += `<Cell ss:StyleID="DataText"><Data ss:Type="String">${escapeXml(fullName)}</Data></Cell>`;
    xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="String">${escapeXml(phone)}</Data></Cell>`;
    xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="String">${escapeXml(doj)}</Data></Cell>`;
    xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="String">${escapeXml(gender)}</Data></Cell>`;
    xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="String">${escapeXml(empId)}</Data></Cell>`;
    xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="String">${escapeXml(dob)}</Data></Cell>`;
    xml += `<Cell ss:StyleID="DataText"><Data ss:Type="String">${escapeXml(desig)}</Data></Cell>`;
    xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="String">${escapeXml(uan)}</Data></Cell>`;
    xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="String">${escapeXml(pan)}</Data></Cell>`;
    xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="String">${escapeXml(bankAcc)}</Data></Cell>`;
    xml += `<Cell ss:StyleID="DataText"><Data ss:Type="String">${escapeXml(bankName)}</Data></Cell>`;
    xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="String">${escapeXml(ifsc)}</Data></Cell>`;
    xml += `<Cell ss:StyleID="DataText"><Data ss:Type="String">${escapeXml(dept)}</Data></Cell>`;
    xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="String">${escapeXml(staffType)}</Data></Cell>`;
    xml += `<Cell ss:StyleID="DataState"><Data ss:Type="String">Attendance State</Data></Cell>`;

    stateList.forEach(st => {
      xml += `<Cell ss:StyleID="DataState"><Data ss:Type="String">${escapeXml(st)}</Data></Cell>`;
    });

    xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="String"></Data></Cell>`;
    xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="Number">${totalPresent}</Data></Cell>`;
    xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="Number">${totalAbsent}</Data></Cell>`;
    xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="Number">${totalHalfDays}</Data></Cell>`;
    xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="Number">${totalPaidLeaves}</Data></Cell>`;
    xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="Number">${totalUnmarked}</Data></Cell>`;
    xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="String">${totOTFormatted}</Data></Cell>`;
    xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="String">${totFineFormatted}</Data></Cell>`;
    xml += `</Row>`;

    // Row 2: IN
    xml += `<Row ss:Height="18">`;
    for (let i = 0; i < 15; i++) xml += `<Cell ss:StyleID="DataText"><Data ss:Type="String"></Data></Cell>`;
    xml += `<Cell ss:StyleID="DataState"><Data ss:Type="String">IN</Data></Cell>`;
    inList.forEach(val => xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="String">${escapeXml(val)}</Data></Cell>`);
    for (let i = 0; i < 8; i++) xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="String"></Data></Cell>`;
    xml += `</Row>`;

    // Row 3: OUT
    xml += `<Row ss:Height="18">`;
    for (let i = 0; i < 15; i++) xml += `<Cell ss:StyleID="DataText"><Data ss:Type="String"></Data></Cell>`;
    xml += `<Cell ss:StyleID="DataState"><Data ss:Type="String">OUT</Data></Cell>`;
    outList.forEach(val => xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="String">${escapeXml(val)}</Data></Cell>`);
    for (let i = 0; i < 8; i++) xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="String"></Data></Cell>`;
    xml += `</Row>`;

    // Row 4: WH
    xml += `<Row ss:Height="18">`;
    for (let i = 0; i < 15; i++) xml += `<Cell ss:StyleID="DataText"><Data ss:Type="String"></Data></Cell>`;
    xml += `<Cell ss:StyleID="DataState"><Data ss:Type="String">WH</Data></Cell>`;
    whList.forEach(val => xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="String">${escapeXml(val)}</Data></Cell>`);
    xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="String">${totWHFormatted}</Data></Cell>`;
    for (let i = 0; i < 7; i++) xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="String"></Data></Cell>`;
    xml += `</Row>`;

    // Row 5: OT
    xml += `<Row ss:Height="18">`;
    for (let i = 0; i < 15; i++) xml += `<Cell ss:StyleID="DataText"><Data ss:Type="String"></Data></Cell>`;
    xml += `<Cell ss:StyleID="DataState"><Data ss:Type="String">OT</Data></Cell>`;
    otList.forEach(val => xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="String">${escapeXml(val)}</Data></Cell>`);
    xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="String">${totOTFormatted}</Data></Cell>`;
    for (let i = 0; i < 7; i++) xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="String"></Data></Cell>`;
    xml += `</Row>`;

    // Row 6: F
    xml += `<Row ss:Height="18">`;
    for (let i = 0; i < 15; i++) xml += `<Cell ss:StyleID="DataText"><Data ss:Type="String"></Data></Cell>`;
    xml += `<Cell ss:StyleID="DataState"><Data ss:Type="String">F</Data></Cell>`;
    fineList.forEach(val => xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="String">${escapeXml(val)}</Data></Cell>`);
    xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="String">${totFineFormatted}</Data></Cell>`;
    for (let i = 0; i < 7; i++) xml += `<Cell ss:StyleID="DataCenter"><Data ss:Type="String"></Data></Cell>`;
    xml += `</Row>`;
  });

  xml += `  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <PageSetup>
    <Layout x:Orientation="Landscape"/>
   </PageSetup>
   <DisplayGridlines/>
  </WorksheetOptions>
 </Worksheet>
</Workbook>`;

  const filename = generatePagarBookMusterRollFilename(fromDateStr, toDateStr, companyName);
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  triggerFileDownload(blob, filename);
}

function triggerFileDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
