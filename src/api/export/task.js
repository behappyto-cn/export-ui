import request from '@/utils/request'

// 查询导出任务列表
export function listTask(query) {
  return request({
    url: '/export/task/list',
    method: 'get',
    params: query
  })
}

// 查询导出任务详细
export function getTask(id) {
  return request({
    url: '/export/task/' + id,
    method: 'get'
  })
}

// 新增导出任务
export function addTask(data) {
  return request({
    url: '/export/task',
    method: 'post',
    data: data
  })
}

// 修改导出任务
export function updateTask(data) {
  return request({
    url: '/export/task',
    method: 'put',
    data: data
  })
}

// 删除导出任务
export function delTask(id) {
  return request({
    url: '/export/task/' + id,
    method: 'delete'
  })
}

// 下载导出任务详细
export function download(id) {
  return request({
    url: '/export/task/download?id=' + id,
    method: 'post',
    timeout: -1
  })
}
