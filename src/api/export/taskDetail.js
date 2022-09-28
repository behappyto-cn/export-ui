import request from '@/utils/request'

// 查询任务明细列表
export function listTaskDetail(query) {
  return request({
    url: '/export/taskDetail/list',
    method: 'get',
    params: query
  })
}

// 查询任务明细详细
export function getTaskDetail(id) {
  return request({
    url: '/export/taskDetail/' + id,
    method: 'get'
  })
}

// 新增任务明细
export function addTaskDetail(data) {
  return request({
    url: '/export/taskDetail',
    method: 'post',
    data: data
  })
}

// 修改任务明细
export function updateTaskDetail(data) {
  return request({
    url: '/export/taskDetail',
    method: 'put',
    data: data
  })
}

// 删除任务明细
export function delTaskDetail(id) {
  return request({
    url: '/export/taskDetail/' + id,
    method: 'delete'
  })
}
