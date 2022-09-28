import request from '@/utils/request'

// 查询导出模板列表
export function listTemplate(query) {
  return request({
    url: '/export/template/list',
    method: 'get',
    params: query
  })
}

// 查询导出模板详细
export function getTemplate(id) {
  return request({
    url: '/export/template/' + id,
    method: 'get'
  })
}

// 新增导出模板
export function addTemplate(data) {
  return request({
    url: '/export/template',
    method: 'post',
    data: data
  })
}

// 修改导出模板
export function updateTemplate(data) {
  return request({
    url: '/export/template',
    method: 'put',
    data: data
  })
}

// 删除导出模板
export function delTemplate(id) {
  return request({
    url: '/export/template/' + id,
    method: 'delete'
  })
}
