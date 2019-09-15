//const serverApiBaseUrl = 'http://103.63.109.191:8012';
const serverApiBaseUrl = 'http://yody.pistrader.com';
// const serverApiBaseUrl = 'http://192.168.1.10:8023';
//const serverApiBaseUrl = 'http://192.168.1.101';

//Your App ID: 1cbeef32-02cf-44b0-aead-fc2c76613157
//qcntfocfgn

export const urlApiPostImageTask = `${serverApiBaseUrl}/Task`;
export const urlApiPostFeedBack = `${serverApiBaseUrl}/Messages`;
export const urlApiPostUserDevice = `${serverApiBaseUrl}/UserDevices/InsertOrUpdate`;
export const urlApiLogin = `${serverApiBaseUrl}/Token`;
export const urlApiPostCommentTask = (taskId, companyId, userId, comment, taskDate) => `${serverApiBaseUrl}/Comment/${taskId}/${companyId}/${userId}/${comment}/${taskDate}`;
export const urlServerImage = (urlImage) => `${serverApiBaseUrl}${urlImage}`;
export const urlApiDetailTask = (taskId) => `${serverApiBaseUrl}/Task/${taskId}`;
export const urlApiDetailImageTask = (taskId, companyId, taskDate) => `${serverApiBaseUrl}/TaskImage/${taskId}/${companyId}/${taskDate}`;
export const urlApiDetailCommentTask = (taskId, companyId, taskDate) => `${serverApiBaseUrl}/TaskComment/${taskId}/${companyId}/${taskDate}`;
export const urlApiGetInfoDepartment = (departmentId) => `${serverApiBaseUrl}/Department/${departmentId}`;
export const urlApiGetInfoCompany = (companyId) => `${serverApiBaseUrl}/Company/${companyId}`;
export const urlApiGetInfoUser = (userId) => `${serverApiBaseUrl}/UserDevices/${userId}`;
export const urlApiGetTasksHasImages = (companyId, date) => `${serverApiBaseUrl}/GetTasksHasImagesByCompanyId/${companyId}/${date}`;
export const urlApiGetTotalTasks = (companyId, date) => `${serverApiBaseUrl}/GetTasksByCompanyId/${companyId}/${date}`;
export const urlApiGetTasksNoImages = (companyId, date) => `${serverApiBaseUrl}/GetTasksNoImageByCompanyId/${companyId}/${date}`;
export const urlApiTaskMessage = (companyId, skip, take) => `${serverApiBaseUrl}/TaskMessage/${companyId}/${skip}/${take}`;
export const urlApiGetCompanyManager = (UserId) => `${serverApiBaseUrl}/GetCompanyManagerByUserId/${UserId}`;
export const urlApiGetTasksAdmin = (companyId, date) => `${serverApiBaseUrl}/GetTasksAdmin/${companyId}/${date}`;
export const urlApiPostDuyetTask = (taskId, userId, companyId, role, taskDate) => `${serverApiBaseUrl}/DuyetCongViec/${taskId}/${userId}/${companyId}/${role}/${taskDate}`;
export const urlApiPostKhongDuyetTask = (taskId, userId, companyId, role, taskDate,lydo) => `${serverApiBaseUrl}/KhongDuyetCongViec/${taskId}/${userId}/${companyId}/${role}/${taskDate}/${lydo}`;
export const urlApiPostCommentTaskAdmin = (taskId, companyId, userId, comment, taskDate) => `${serverApiBaseUrl}/CommentAdmin/${taskId}/${companyId}/${userId}/${comment}/${taskDate}`;
export const urlApiTaskMessageAdmin = (userId, skip, take) => `${serverApiBaseUrl}/TaskMessageAdmin/${userId}/${skip}/${take}`;