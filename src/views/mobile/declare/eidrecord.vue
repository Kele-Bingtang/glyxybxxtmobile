<template>
  <div class="main" ref="main">
    <div class="main-header">
      <div class="title">{{ewmDD}}</div>
      <div class="back" @click="toDeclarePath" v-if="authInfo.eid">继续申报</div>
    </div>
    <div class="main-content" ref="main-content">
      <div v-if="blist.length">
        <div
          v-for="(item, index) in blist"
          class="main-content-item completed"
          :key="index"
        >
          <div class="bid">申报人：{{ item.sbr }}</div>
          <div class="date">
            <i class="el-icon-time"></i>
            <span>{{ $moment(item.sbsj).format(format) }}</span>
          </div>
          <div class="category">
            报修类别：{{ item.bxlb }}
          </div>
          <div class="desc">{{ item.bxnr }}</div>
        </div>
      </div>
      <div v-else class="no-data">
        <no-data-show style="height: 300px;" show-text="无申报记录"></no-data-show>
      </div>
    </div>
    <el-backtop target=".main"></el-backtop>
  </div>
</template>

<script>
  import noDataShow from '@/mobile/noDataShow'
  import config from '@/config'
  import { getAuthInfo } from '@/utils/cookie'
  import { BxdServlet } from '@/api/BxdServlet'
  import {EwmServlet} from "@/api/EwmServlet";

  export default {
    name: 'DeclareEidRecord',
    components: { noDataShow },
    data() {
      return {
        format: 'YYYY/MM/DD HH:mm',
        scrollTop: 0,
        blist: [],
        ewmDD: ''
      }
    },
    computed: {
      authInfo() {
        return getAuthInfo()
      },
      detailPath() {
        return config.declareDetailsPath.replace(':id', '')
      }
    },
    mounted() {
      if (this.authInfo.sf != 1) {
        this.$router.push('/no-permission')
      }
      const mainDiv = this.$refs['main']
      mainDiv.addEventListener('scroll', () => {
        this.scrollTop = mainDiv.scrollTop
      })
      this.getEwmLocation()
      this.getBxd()
    },
    activated() {
      this.$refs['main'].scrollTop = this.$route.meta.scrollTop || 0
    },
    // 详情页面的beforeRouteLeave钩子函数
    beforeRouteLeave(to, from, next) {
      if (to.path === config.declarePath) {
        this.scrollTop = 0
      }
      from.meta.scrollTop = this.scrollTop
      next()
    },
    methods: {
      /**
       * 获取二维码的地点
       */
      getEwmLocation() {
        EwmServlet ({
          op: 'selEwmById',
          ewmId: this.authInfo.eid
        }).then(res => {
          if (res.obj && res.obj.ewmDetail) {
            this.ewmDD = res.obj.ewmDetail.xxdd;
          } else {
            this.$notify({ type: 'warning', message: '数据异常', duration: 1000 })
          }
        }).catch(() => {
          this.$notify({ type: 'error', message: '接口异常', duration: 1000 })
        })
      },
      /**
       * 获取正在申报列表
       */
      getBxd() {
        BxdServlet({
          op: 'selbxdforeid',
          eid: this.authInfo.eid
        }).then(res => {
          if (res.obj && res.obj.blist) {
            this.blist = res.obj.blist
          } else {
            this.$notify({ type: 'warning', message: '数据异常', duration: 1000 })
          }
        }).catch(() => {
          this.$notify({ type: 'error', message: '接口异常', duration: 1000 })
        })
      },
      toDeclarePath() {
        this.$router.push({ path: config.declarePath })
      }
    }
  }
</script>

<style lang="scss" scoped>
  div {
    box-sizing: border-box;
  }

  .main {
    width: 750px;
    height: 100%;
    background: rgba(244, 246, 248, 1);
    overflow-y: auto;
    overflow-x: hidden;

    &-header {
      width: 750px;
      height: 162px;
      padding: 20px 0;
      background: #fff;
      box-shadow: 4px 6px 16px rgba(150, 150, 150, 0.2);
      position: sticky;
      top: 0;
      z-index: 999;

      .title {
        width: 370px;
        height: 90px;
        float: left;
        font-size: 40px;
        font-family: PingFang SC;
        font-weight: bold;
        line-height: 60px;
        color: rgba(74, 88, 96, 1);
        margin: 25px 0 10px 48px;
      }

      .back {
        height: 44px;
        float: right;
        font-size: 32px;
        font-family: PingFang SC;
        font-weight: 400;
        line-height: 44px;
        color: rgba(16, 175, 90, 1);
        cursor: pointer;
        margin: 34px 52px 34px 0;
      }
    }

    &-content {
      width: 750px;
      height: auto;
      padding: 20px 0;

      &-item {
        width: 100%;
        height: 234px;
        background: rgba(16, 175, 90, 1);
        box-shadow: 4px 6px 16px rgba(150, 150, 150, 0.2);
        margin: 2px 0;
        position: relative;

        .bid {
          position: absolute;
          top: 38px;
          left: 38px;
          width: 320px;
          height: 36px;
          font-size: 26px;
          font-family: PingFang SC;
          font-weight: 400;
          line-height: 36px;
          color: rgba(255, 255, 255, 1);
          opacity: 0.5;
          word-break: break-all;
        }

        .date {
          position: absolute;
          top: 38px;
          right: 38px;
          width: auto;
          height: 36px;
          font-size: 26px;
          font-family: PingFang SC;
          font-weight: 400;
          line-height: 36px;
          color: rgba(255, 255, 255, 1);
          opacity: 0.5;
        }

        .category {
          position: absolute;
          bottom: 76px;
          left: 38px;
          width: 570px;
          height: 50px;
          font-size: 34px;
          font-family: PingFang SC;
          font-weight: bold;
          line-height: 50px;
          color: rgba(255, 255, 255, 1);
          opacity: 1;
          word-break: break-all;
        }

        .state {
          position: absolute;
          bottom: 40px;
          right: 36px;
          width: 176px;
          height: 64px;
          font-size: 30px;
          font-weight: bold;
          color: rgba(255, 255, 255, 1);
          /*background: rgba(6, 113, 56, .8);*/
          border-radius: 160px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .desc {
          position: absolute;
          bottom: 30px;
          left: 38px;
          width: 400px;
          height: 40px;
          font-size: 28px;
          font-family: PingFang SC;
          font-weight: 400;
          line-height: 40px;
          color: rgba(255, 239, 156, 1);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      &-item.completed {
        background: rgba(255, 255, 255, 1);

        .bid, .date, .state {
          color: #4A5860;
        }

        .category {
          color: #10AF5A;
        }

        .state {
          background: transparent;
        }

        .desc {
          color: #4A5860;
        }
      }

      .no-data {
        height: 600px;
      }
    }
  }
</style>
