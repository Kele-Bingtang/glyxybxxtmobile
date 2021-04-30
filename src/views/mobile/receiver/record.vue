<template>
  <div class="main" ref="main">
    <div class="main-user">
      <div class="avatar">
        <img :src="authInfo.head" width="100%" height="100%"/>
      </div>
      <div class="name">姓名：{{ authInfo.xm }}</div>
      <div class="student-id">工号：{{ authInfo.xh }}</div>
      <div class="gs">
        <div class="gs-text">剩余工时：</div>
        <div class="gs-progress">
          <el-progress v-if="gs || gs == 0" :text-inside="false" :stroke-width="12" :percentage="((12 - gs) / 12) * 100" :color="customColors" :format="formatGs"></el-progress>
        </div>
      </div>
      <div class="wysb">
        <van-button class="button-item" type="primary" size="normal" round @click.prevent="toMyDeclare()">我要申报</van-button>
      </div>
      <div class="wxls">
        <van-button v-if="presta" class="button-item " type="primary" size="normal" round @click.prevent="myHistorydd()">维修历史</van-button>
      </div>
    </div>
    <div class="main-header">
      <div class="title">工单记录</div>
      <div class="fl">
        <div class="qd">
          <van-dropdown-menu>
            <van-dropdown-item title="签到" ref="qd">
              <van-radio-group v-model="xq">
                <van-cell-group>
                  <van-cell v-for="(item, index) in campus" :key="index" :title="item.text" clickable
                            @click="xq = item.value">
                    <template #right-icon>
                      <van-radio :name="item.value"/>
                    </template>
                  </van-cell>
                </van-cell-group>
              </van-radio-group>
              <van-button block type="info" @click="onSignin(1)">确认签到</van-button>
            </van-dropdown-item>
          </van-dropdown-menu>
        </div>
        <div class="qd">
          <van-dropdown-menu active-color="#ee0a24">
            <van-dropdown-item title="签退" ref="qt">
              <van-radio-group v-model="xq" checked-color="#ee0a24">
                <van-cell-group>
                  <van-cell v-for="(item, index) in campus" :key="index" :title="item.text" clickable
                            @click="xq = item.value">
                    <template #right-icon>
                      <van-radio :name="item.value"/>
                    </template>
                  </van-cell>
                </van-cell-group>
              </van-radio-group>
              <van-button block type="info" color="#ee0a24" @click="onSignin(2)">确认签退</van-button>
            </van-dropdown-item>
          </van-dropdown-menu>
        </div>
        <div class="qd">
          <van-dropdown-menu active-color="#07C160">
            <van-dropdown-item title="记录" @open="onRecord">
              <van-cell v-for="(item, index) in qdlist" :key="index" >
                <!-- 使用 title 插槽来自定义标题 -->
                <template #title>
                  <van-tag :type="item.state === 1 ? 'success' : 'danger'">{{ item.state === 1 ? '签到' : '签退' }}</van-tag>
                  <span class="custom-title">{{item.xq}}</span>
                </template>
                <template #extra>
                  {{$moment(item.qdsj).format('YYYY-MM-DD HH:mm')}}
                </template>
              </van-cell>
            </van-dropdown-item>
          </van-dropdown-menu>
        </div>
      </div>
    </div>
    <div class="main-content" ref="main-content">
      <div v-if="jblist.length && sta ">
        <div
          v-for="(item, index) in handleBlist"
          :class="['main-content-item', { 'completed': item.state === 2 || item.state === 3 }]"
          :key="index"
          @click="onItemClick(item)"
        >
          <div class="bid">编号：{{ item.id }}</div>
          <div class="date">
            <i class="el-icon-time"></i>
            <span>{{ $moment(item.sbsj).format(format) }}</span>
          </div>
          <div class="category">
            报修类别：{{ item.bxlb }}
          </div>
          <div class="state">
            {{ getState(item.state).text }}
          </div>
          <div class="desc">{{ item.bxnr }}</div>
        </div>
      </div>
      <div v-else-if="jblists.length && !presta ">
        <div
          v-for="(item, index) in handleAllBlist"
          :class="['main-content-item', { 'completed': item.state === 2 || item.state === 3 }]"
          :key="index"
          @click="onItemClick(item)"
        >
          <div class="bid">编号：{{ item.id }}</div>
          <div class="date">
            <i class="el-icon-time"></i>
            <span>{{ $moment(item.sbsj).format(format) }}</span>
          </div>
          <div class="category">
            报修类别：{{ item.bxlb }}
          </div>
          <div class="state">
            {{ getState(item.state).text }}
          </div>
          <div class="desc">{{ item.bxnr }}</div>
        </div>
      </div>
      <div v-else class="no-data">
        <no-data-show style="height: 300px;" show-text="无工单记录"></no-data-show>
      </div>
    </div>
    <el-backtop target=".main"></el-backtop>
  </div>
</template>

<script>
  import noDataShow from '@/mobile/noDataShow'
  import config from '@/config'
  import { getAuthInfo } from '@/utils/cookie'
  import { ShyServlet } from '@/api/ShyServlet'
  import { JdrServlet } from '@/api/JdrServlet'
  import { sortBxd } from '@/utils/common'
  import { mapGetters } from 'vuex'
  import { setAuthInfo } from '@/utils/cookie'

  export default {
    name: 'ReceiverRecord', // 接单人的工单记录
    components: { noDataShow },
    data() {
      return {
        sta: true,
        presta: true,
        jblists: [],
        switchAutoMonior: true, // 自动监控
        timer: null, // 定时器

        format: 'YYYY/MM/DD HH:mm',
        scrollTop: 0,
        campus: config.campus,
        xq: null,

        qdlist: [], // 签到记录
        gs: '', // 工时
        customColors: [
          {color: '#f56c6c', percentage: 25},
          {color: '#e6a23c', percentage: 50},
          {color: '#6f7ad3', percentage: 75},
          {color: '#409EFF', percentage: 100}
        ]
      }
    },
    computed: {
      ...mapGetters(['config', 'jblist']),
      authInfo() {
        return getAuthInfo()
      },
      detailPath() {
        return config.receiverDetailsPath.replace(':id', '')
      },
      handleBlist() {
        // 对报修单按进度排序
        const sbz = [] // 申报中
        const wxz = [] // 维修中
        const ywx = [] // 已维修
        const def = [] // 其他
        this.jblist.forEach((item) => {
          if (item.state == 0) {
            sbz.push(item)
          } else if (item.state == 1) {
            wxz.push(item)
          } else if (item.state == 2) {
            ywx.push(item)
          } else {
            def.push(item)
          }
        })

        // 时间从新到旧排序
        sbz.sort(sortBxd)
        wxz.sort(sortBxd)
        ywx.sort(sortBxd)
        def.sort(sortBxd)

        return sbz.concat(wxz, ywx, def)
      },
      handleAllBlist () {
        // 对报修单按进度排序
        const sbz = [] // 申报中
        const wxz = [] // 维修中
        const ywx = [] // 已维修
        const def = [] // 其他
        this.jblists.forEach((item) => {
          if (item.state == 0) {
            sbz.push(item)
          } else if (item.state == 1) {
            wxz.push(item)
          } else if (item.state == 2) {
            ywx.push(item)
          } else {
            def.push(item)
          }
        })

        // 时间从新到旧排序
        sbz.sort(sortBxd)
        wxz.sort(sortBxd)
        ywx.sort(sortBxd)
        def.sort(sortBxd)

        return sbz.concat(wxz, ywx, def)
      }

    },
    mounted() {
      if (this.authInfo.sf != 2 ) {
        this.$router.push('/no-permission')
      }

      const mainDiv = this.$refs['main']
      mainDiv.addEventListener('scroll', () => {
        this.scrollTop = mainDiv.scrollTop
      })
      if (!this.jblist.length) {
        this.$store.dispatch('jdr/getBxdList')
      }

      this.getGs() // 剩余工时
      this.autoMonitor()
    },
    activated() {
      this.$refs['main'].scrollTop = this.$route.meta.scrollTop || 0
      this.autoMonitor()
    },
    // 详情页面的beforeRouteLeave钩子函数
    beforeRouteLeave(to, from, next) {
      if (to.path === config.declarePath) {
        this.scrollTop = 0
      }
      from.meta.scrollTop = this.scrollTop

      this.stopMonitor()
      next()
    },
    methods: {
      /**
       * 转换身份，进行申报
       * */
      toMyDeclare(){
        this.authInfo.sf = 1;
        //改变当前身份状态，存入cookie
        setAuthInfo(this.authInfo)
        if (this.authInfo.eid) {
          // 跳转至正在申报列中的列表页面
          let recordPath = config.declareEidRecordPath.replace(':id', '')
          this.$router.push(recordPath + this.authInfo.eid)
        } else {
          // 跳转申报记录页面
          let recordPath = config.declareRecordPath.replace(':id', '')
          this.$router.push(recordPath + this.authInfo.xh)
        }
      },
      /*查询已维修的订单*/
      myHistorydd() {
        this.sta = false;
        this.presta = false;
        this.jblists = [];
        JdrServlet({
          op: 'selbxdbyjdr',
          jid: this.authInfo.ybid
        }).then(res => {
          for (let i = 0; i < res.obj.blist.length; i++) {
            // let state = res.obj.blist[i].state;
            if (res.obj.blist[i].state == 4) {
              this.jblists.push(res.obj.blist[i])
            }
          }
        })
      },

      /**
       * 剩余工时
       */
      getGs() {
        JdrServlet({
          op: 'selgs',
          // jid: this.authInfo.ybid,
          ybid: this.authInfo.ybid,
        }).then(res => {
            this.gs = res.obj.gs;
          if (this.gs >12){
            this.gs = 12
          }
        })
      },
      formatGs() {
        let multiplier = 100
        let gs = (12 * multiplier - this.gs * multiplier) / 100 // ×100 防止精度丢失
        return `${gs}`;
      },
      /**
       * 自动监控，每隔n秒刷新一次数据
       */
      autoMonitor() {
        this.stopMonitor()
        if (this.switchAutoMonior && this.config.jdrtime) {
          this.timer = setInterval(this.queryData, this.config.jdrtime * 1000)
        }
      },
      /**
       * 停止自动监控
       */
      stopMonitor() {
        clearInterval(this.timer)
        this.timer = null
      },
      /**
       * 监控模式切换
       */
      handleMonitorSwitch() {
        if (this.switchAutoMonior) {
          this.autoMonitor()
          this.$message.success('自动监测已开启')
        } else {
          this.stopMonitor()
          this.$message.success('自动监测已关闭')
        }
      },
      /**
       * 查询数据
       */
      queryData() {
        // 获取报修单数量
        this.$store.dispatch('jdr/getBxdList')
      },
      /**
       * 根据状态值返回当前状态
       * @param state
       * @returns {*}
       */
      getState(state) {
        const item = config.progress && config.progress.filter(item => item.value === state)
        return item && item[0]
      },
      /**
       * 进入工单详情页
       * @param item
       */
      onItemClick(item) {
        this.$router.push(`${this.detailPath}${item.id}`)
      },
      /**
       * 签到或签退，接单人和审核员共用该接口
       */
      onSignin(state) {
        if (this.xq === null) {
          this.$notify({ type: 'warning', message: '请选择值班校区', duration: 1000 })
          return
        }
        ShyServlet({
          op: 'qd', // 调用方法，固定值*
          xq: this.xq, // 当前所在校区（定位判断或者手动输入）0临桂校区，1东城校区
          ybid: this.authInfo.ybid, // 易班id*
          state: state // 状态 1签到 2签退
        }).then(res => {
          if (state === 1) {
            this.$refs.qd.toggle()
          } else if (state === 2) {
            this.$refs.qt.toggle()
          }
          if (res.status === 'success') {
            this.$toast({
              message: state === 1 ? '签到成功' : '签退成功',
              icon: config.icons + 'icon_suc@2x.png',
              duration: 1500,
              onClose: () => {

              }
            })
          } else {
            this.$toast({
              message: state === 1 ? '签到失败' : '签退失败',
              icon: config.icons + 'tip_info@2x.png',
              duration: 1500
            })
          }
        }).catch(() => {
          this.$toast({
            message: state === 1 ? '签到失败' : '签退失败',
            icon: config.icons + 'tip_info@2x.png',
            duration: 1500
          })
        })
      },
      /**
       * 查询签到记录，接单人和审核员共用该接口
       */
      onRecord() {
        ShyServlet({
          op: 'selqdb', // 调用方法，固定值*
          ybid: this.authInfo.ybid, // 易班id*
          page: 1, // 第几页
          num: 30 // 多少条
        }).then(res => {
          if (res.obj && res.obj.qlist) {
            this.qdlist = res.obj.qlist
          } else {
            this.$notify({ type: 'error', message: '数据异常', duration: 1000 })
          }
        }).catch(err => {
          this.$notify({ type: 'error', message: '接口异常或网络中断', duration: 1000 })
        })
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

    &-user {
      width: 750px;
      height: 152px;
      background-color: #fff; // #F4F6F8;
      font-family: PingFang SC;
      box-sizing: border-box;
      position: sticky;
      top: -3px;
      z-index: 999;

      .avatar {
        width: 90px;
        height: 90px;
        position: absolute;
        top: 30px;
        left: 48px;
        background: rgba(0, 0, 0, 0);
        border-radius: 50%;
        overflow: hidden;
      }

      .name {
        height: 44px;
        position: absolute;
        top: 30px;
        left: 156px;
        font-size: 28px;
        font-weight: 500;
        line-height: 44px;
        color: rgba(74, 88, 96, 1);
      }

      .student-id {
        height: 36px;
        position: absolute;
        top: 80px;
        left: 156px;
        font-size: 28px;
        font-weight: 400;
        line-height: 36px;
        color: rgba(74, 88, 96, 1);
        opacity: 0.5;
      }

      .wysb{
         position: absolute;
         top: 45px;
         right: 160px;
         width: 140px;
       }
      .wxls{
        position: absolute;
        top: 45px;
        right: 10px;
        width: 140px;
      }
      .gs {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 280px;

        .gs-text{
          font-size: 18px;
          display: inline-block;
        }
        .gs-progress{
          position: absolute;
          right: 10px;
          width: 160px;
          display: inline-block;
          .el-progress__text {
            font-size: 18px !important;
          }
        }
      }
    }

    &-header {
      width: 750px;
      height: 162px;
      padding: 20px 0;
      background: #fff;
      box-shadow: 4px 6px 16px rgba(150, 150, 150, 0.2);
      position: sticky;
      top: 0;
      z-index: 999;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .title {
        width: 256px;
        height: 90px;
        float: left;
        font-size: 52px;
        font-family: PingFang SC;
        font-weight: bold;
        line-height: 90px;
        color: rgba(74, 88, 96, 1);
        margin: 12px 0 10px 48px;
      }

      /deep/.qd {
        float: left;
        margin-right: 30px;

        .van-dropdown-menu__bar {
          box-shadow: none;
        }
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
        width: 690px;
        height: 234px;
        background: rgba(16, 175, 90, 1);
        box-shadow: 4px 6px 16px rgba(150, 150, 150, 0.2);
        border-radius: 32px;
        margin: 24px 30px;
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
          bottom: 18px;
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
