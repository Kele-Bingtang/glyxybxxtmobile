<template></template>

<script>
  import config from '@/config'
  import { setAuthInfo } from '@/utils/cookie'
  import { auth } from '@/utils/auth'

  export default {
    name: 'Redirect', // 处理用户登录之后身份信息不同重定向
    data() {
      return {
        headimg: require('@/assets/head.png')
      }
    },
    mounted() {
      let query = this.$route.query
      let mock = true;
      if (mock) {
        let sf = 2
        // 身份信息：1学生，2接单人，3审核员
        switch (sf) {
          case 1:
            query = {
              xm: '王佐鸿',
              xh: '1700730135',
              head: 'http://img02.fs.yiban.cn/5000209/avatar/user/200',
              sf: 1,
              ybid: 12494620,
              eid: 10
            }
            break
          case 2:
            query = {
              xm: '中核 张岩',
              xh: '212016505',
              sf: 2,
              ybid: 41790787,
              eid: 10
            }
            break
          case 3:
            query = {
              // xm: '徐仰月',
              // xh: '212012503',
              // sf: 3,
              // ybid: 38714856,
              // eid: 10
              xm: '马良',
              xh: '212014505', //gh
              sf: 3,
              ybid: '41820927', //ybid
              eid: 10
            }
            break
        }
      }

      // 学号或工号、身份、易班id三个参数必须存在才能通过授权
      if (query.xh && query.sf && query.ybid) {
        // 默认姓名和头像
        // unescape 解析
        query.xm =  unescape(query.xm.replace(/\\u/g, "%u")) || '路人甲'
        query.head =  query.head || this.headimg
        // 信息保存cookie
        setAuthInfo(query)
        // 判断身份 身份信息：1学生，2工人，3审核员
        let sf = Number(query.sf)
        switch (sf) {
          case 1:
            // 判断是否有无eid，有 进入申报页，没有 进入申报列表
            if (query.eid) {
              // 跳转至正在申报列中的列表页面
              let recordPath = config.declareEidRecordPath.replace(':id', '')
              this.$router.push(recordPath + query.eid)
            } else {
              // 跳转申报记录页面
              let recordPath = config.declareRecordPath.replace(':id', '')
              this.$router.push(recordPath + query.xh)
            }
            break
          case 2:
            this.$router.push({ path: config.receiverRecordPath, query })
            break
          case 3:
            this.$router.push({ path: config.checkerRecordPath, query })
            break
        }
      } else {
        auth()
      }
    },
    methods: {}
  }
</script>

<style lang="scss" scoped>
  .main {
    width: 100%;
    height: 100%;
  }
</style>
