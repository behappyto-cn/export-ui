import request from '@/utils/request'

// 查询应用信息列表
export function listApp(query) {
  return request({
    url: '/export/app/list',
    method: 'get',
    params: query
  })
}

// 查询应用信息详细
export function getApp(id) {
  return request({
    url: '/export/app/' + id,
    method: 'get'
  })
}

// 新增应用信息
export function addApp(data) {
  return request({
    url: '/export/app',
    method: 'post',
    data: data
  })
}

// 修改应用信息
export function updateApp(data) {
  return request({
    url: '/export/app',
    method: 'put',
    data: data
  })
}

// 删除应用信息
export function delApp(id) {
  return request({
    url: '/export/app/' + id,
    method: 'delete'
  })
}
