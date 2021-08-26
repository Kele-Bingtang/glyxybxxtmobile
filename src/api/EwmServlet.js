import request from '@/utils/request'

/**
 * 接口
 * @param data
 * @constructor
 */
export function EwmServlet(data) {
  return request({
    url: '/EwmServlet',
    method: 'post',
    data
  })
}

