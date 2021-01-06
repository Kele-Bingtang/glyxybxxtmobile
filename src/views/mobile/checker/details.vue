<template>
  <div class="main" ref="main">
    <div class="main-header" ref="main-header">
      <div class="title" ref="title">申报单</div>
      <div class="back" ref="back" @click="$router.go(-1)">返回</div>
    </div>
    <div class="main-progress">
      <!--显示分数-->
      <template v-if="showScore">
        <!--已维修但是未评价-->
        <template v-if="unevaluated">
          <div class="unevaluated-score score">
            <!--否则只提示未评分-->
            <div class="unevaluated-title-isqrcode">未评分</div>
          </div>
        </template>
        <!--已维修而且已评价-->
        <div v-else class="score">
          <div class="title">本次维修服务评分</div>
          <div class="stars">
            <el-rate
              v-model="bxdInfo.pj"
              disabled
              show-text
              :max="max"
              :texts="evaluate"
              text-color="#ff9900">
            </el-rate>
          </div>
          <div class="evaluate">
            {{bxdInfo.pjnr}}
          </div>
          <div v-if="bxdInfo.pjzj" class="evaluate evaluate-add">
            追加：{{bxdInfo.pjzj}}
          </div>
        </div>
      </template>
      <div class="progress">
        <el-steps
          v-if="bxdInfo.step"
          class="progress-steps"
          :active="bxdInfo.step.active"
          :space="90"
          direction="vertical"
          process-status="finish"
          finish-status="success"
        >
          <el-step
            class="progress-step"
            v-for="(item, index) of bxdInfo.step.steps"
            :key="index"
          >
            <div slot="title" class="title">{{item.title}}</div>
            <div slot="description">
              <div class="date">{{item.time}}</div>
              <div class="desc" v-html="item.desc"></div>
            </div>
          </el-step>
        </el-steps>
      </div>
    </div>
    <div class="main-content">
      <div v-if="showBxdInfo">
        <div class="category">报修类别：{{ bxdInfo.bxlb }}</div>
        <div class="desc">内容：{{ bxdInfo.bxnr }}</div>
        <div class="img-grid">
          <van-grid v-show="img" :column-num="3">
            <van-grid-item
              class="img-grid-item"
              v-for="(src, index) in images"
              :key="index"
              @click="handleImagePreview(index)"
            >
              <van-image class="image" :src="src" fit="cover"/>
            </van-grid-item>
          </van-grid>
          <div v-if="video" class="videoBox">
            <video width="320" height="200" controls :src="videoUrl" preload="auto">
              您的浏览器不支持Video标签。
            </video>
          </div>
        </div>
        <div class="container">

          <van-divider dashed></van-divider>
          <div class="container-item">
            <div class="container-item-left">申报人：</div>
            <div class="container-item-right">{{ bxdInfo.sbr }}</div>
          </div>
          <div class="container-item">
            <div class="container-item-left">学号：</div>
            <div class="container-item-right" v-if="eid && isEncry">{{ encryStudentID(bxdInfo.sbrxh) }}</div>
            <div class="container-item-right" v-else>{{ bxdInfo.sbrxh }}</div>
          </div>
          <div class="container-item">
            <div class="container-item-left">联系方式：</div>
            <!--            <div class="container-item-right" v-if="eid && isEncry">{{ encryPhoneNumber(bxdInfo.sbrsj) }}</div>-->
            <div class="container-item-right">{{ bxdInfo.sbrsj }}</div>
          </div>

          <van-divider dashed></van-divider>
          <div class="container-item">
            <div class="container-item-left">单号：</div>
            <div class="container-item-right">{{ bxdInfo.id }}</div>
          </div>
          <div class="container-item">
            <div class="container-item-left">申报时间：</div>
            <div class="container-item-right">{{ bxdInfo.sbsj && $moment(bxdInfo.sbsj).format(format) }}</div>
          </div>
          <div class="container-item">
            <div class="container-item-left">预约时间：</div>
            <div class="container-item-right">{{ bxdInfo.yysj }}</div>
          </div>
          <div class="container-item">
            <div class="container-item-left">所在校区：</div>
            <div class="container-item-right">{{ bxdInfo.xq }}</div>
          </div>
          <div class="container-item">
            <div class="container-item-left">区域类别：</div>
            <div class="container-item-right">{{ bxdInfo.qylb }}</div>
          </div>
          <div class="container-item">
            <div class="container-item-left">详细地址：</div>
            <div class="container-item-right">{{ bxdInfo.xxdd }}</div>
          </div>

          <van-divider dashed></van-divider>
          <template v-if="bxdInfo.j">
            <div class="container-item">
              <div class="container-item-left">维修人员：</div>
              <div class="container-item-right">{{ bxdInfo.j.xm }}</div>
            </div>
            <div class="container-item">
              <div class="container-item-left">联系方式：</div>
              <!--              <div class="container-item-right" v-if="isQrcode && isEncry">{{ encryPhoneNumber(bxdInfo.j.sj) }}</div>-->
              <div class="container-item-right">
                {{ bxdInfo.j.sj }}
                <span class="tel" @click="handleTel(bxdInfo.j.sj)"></span>
              </div>
            </div>
            <div class="container-item">
              <div class="container-item-left">工号：</div>
              <div class="container-item-right">{{ bxdInfo.j.gh }}</div>
            </div>
            <div class="container-item">
              <div class="container-item-left">邮箱：</div>
              <!--              <div class="container-item-right" v-if="isQrcode && isEncry">{{ encryEmail(bxdInfo.j.email) }}</div>-->
              <div class="container-item-right">{{ bxdInfo.j.yx }}</div>
            </div>
            <div class="container-item">
              <div class="container-item-left">耗材：</div>
              <div class="container-item-right gs">
                <van-cell-group>
                  <van-cell
                    class="my-van-cell"
                    v-for="item in hc"
                    :key="item.id"
                    :title="item.mc">
                    <template #extra>
                      <span class="my-tag orange-txt">{{item.sl}}</span>
                      <span class="unit orange-txt">{{item.dw}}</span>
                    </template>
                  </van-cell>
                </van-cell-group>
              </div>
            </div>
            <div v-if="fghc.length >0" class="container-item">
              <div  class="container-item-left">返工耗材：</div>
              <div class="container-item-right gs">
                <van-cell-group>
                  <van-cell
                    class="my-van-cell"
                    v-for="item in fghc"
                    :key="item.id"
                    :title="item.mc">
                    <template #extra>
                      <span  v-if="item.xh" class="hcxh orange-txt">{{item.xh}}</span>
                      <span class="my-tag orange-txt">{{item.sl}}</span>
                      <span class="unit orange-txt">{{item.dw}}</span>
                    </template>
                  </van-cell>
                </van-cell-group>
              </div>
            </div>
            <div class="container-item">
              <div class="container-item-left">工时：</div>
              <div class="container-item-right orange-txt">
                <span v-if="hc">{{bxdInfo.gs}} </span>
                <span v-else>--</span>
              </div>
            </div>
          </template>

          <template v-if="bxdInfo.s1">
            <van-divider dashed></van-divider>
            <div class="container-item">
              <div class="container-item-left">审核员1：</div>
              <div class="container-item-right">{{ bxdInfo.s1.xm }}</div>
            </div>
            <div class="container-item">
              <div class="container-item-left">工号：</div>
              <div class="container-item-right">{{ bxdInfo.s1.gh }}</div>
            </div>
            <div class="container-item">
              <div class="container-item-left">审核状态：</div>
              <div class="container-item-right">
                <van-tag v-if="bxdInfo.s1.tag" :type="bxdInfo.s1.tag" size="medium">{{ bxdInfo.s1.zt }}</van-tag>
                <van-tag v-else size="medium">{{ bxdInfo.s1.zt }}</van-tag>
              </div>
            </div>
          </template>

          <template v-if="bxdInfo.s2">
            <van-divider dashed></van-divider>
            <div class="container-item">
              <div class="container-item-left">审核员2：</div>
              <div class="container-item-right">{{ bxdInfo.s2.xm }}</div>
            </div>
            <div class="container-item">
              <div class="container-item-left">工号：</div>
              <div class="container-item-right">{{ bxdInfo.s2.gh }}</div>
            </div>
            <div class="container-item">
              <div class="container-item-left">审核状态：</div>
              <div class="container-item-right">
                <van-tag v-if="bxdInfo.s2.tag" :type="bxdInfo.s2.tag" size="medium">{{ bxdInfo.s2.zt }}</van-tag>
                <van-tag v-else size="medium">{{ bxdInfo.s2.zt }}</van-tag>
              </div>
            </div>
          </template>
        </div>
        <div class="button">
          <template v-if="eid != null & bxdshystate & hcAndGsState">
            <van-button class="button-item select" type="primary" size="normal" round
                        @click.prevent="shyPass('确定通过', 1)">通过审核
            </van-button>
            <van-button class="button-item complete" type="danger" size="normal" round
                        @click.prevent="shyPass('确定不通过', 2)">不通过审核
            </van-button>
          </template>
        </div>
        <div class="button">
          <template v-if="ysr">
            <van-button class="button-item select" type="primary" size="normal" round
                        @click.prevent="ysrPass('确定通过', 4)">通过验收
            </van-button>
            <van-button class="button-item complete" type="danger" size="normal" round
                        @click.prevent="ysrPass('确定不通过', 5)">不通过验收
            </van-button>
          </template>
        </div>
      </div>
      <div v-else class="no-data">
        <no-data-show></no-data-show>
      </div>
    </div>

    <van-image-preview
      v-model="imagePreview"
      :startPosition="imageIndex"
      :images="images"
    >
    </van-image-preview>

    <!--顶部弹出popup-->
    <van-popup
      v-model="popupShow"
      class="van-popup-tip"
      position="top"
    >
      <van-icon name="warning-o" style="margin-right: 6px;"/>
      {{popupText}}
    </van-popup>


    <!-- add 20200901 -->
    <!--填写耗材和工时-->
    <van-dialog v-model="hcDialog" :show-confirm-button="false" :showCancelButton="hc.length === 0" width="94%"
                @cancel="cancleHc">
      <div class="hc-dialog" slot="default">
        <div class="title">耗材：</div>
        <div class="desc">
          <!-- <van-field
            v-model="hc"
            class="desc-field"
            type="textarea"
            placeholder="请填写耗材明细，若未使用耗材填写“无”即可"
            rows="3"
            autosize
          /> -->
          <div class="select-hc">
            <div
              v-for="item in hc"
              :key="item.id"
              class="hc"
            >
              <div class="hc-name">{{item.mc}}</div>
              <van-stepper class="hc-sl" v-model="item.sl" :min="0" input-width="50px" button-size="26px"/>
              <div class="hc-dw">{{item.dw}}</div>
              <van-icon class="hc-del" :name="icons + 'icon_delete_s@2x.png'" @click="removeHc(item.id)"/>
            </div>
            <van-button class="button-add" type="primary" size="large" plain round @click.prevent="showHcList">点击添加耗材
            </van-button>
          </div>
        </div>
        <div class="title">工时：</div>
        <div class="desc" style="text-align: center;">
          <van-stepper v-model="gs" :min="0" step="0.01" input-width="150px" button-size="38px"/>
        </div>
        <div class="button" v-if="hc.length > 0">
          <van-button class="button-submit" type="primary" size="large" @click="completeHcList">确定</van-button>
          <van-button class="button-cancle" size="large" @click="cancleHc">取消</van-button>
        </div>
      </div>
    </van-dialog>

    <!--耗材列表上拉菜单-->
    <van-action-sheet
      v-model="showHcListActionSheet"
      title="耗材列表"
      class="hclist-action-sheet"
      :actions="hclist"
      cancel-text="取消"
      @select="onSelectHc"
    >
    </van-action-sheet>

  </div>
</template>

<script>
  /**
   * 审核员-报修单详情
   */
  import {AdminServlet} from '@/api/AdminServlet'
  import {ShyServlet} from '@/api/ShyServlet'
  import {HcServlet} from '@/api/HcServlet'
  import {encryPhoneNumber, encryStudentID, encryEmail} from '@/utils/encryption'
  import {phone_yb} from '@/utils/yb_h5'
  import config from '@/config'
  import noDataShow from '@/mobile/noDataShow'
  import {getBxdShState, copyObj} from "../../../utils/common";
  import {getAuthInfo} from "../../../utils/cookie";
  import { setAuthInfo } from '@/utils/cookie'

  export default {
    name: 'ReceiverDetails',
    components: {noDataShow},
    data() {
      return {
        hcAndGsState: true, // 耗材 有耗材时显示审核按钮
        bxdshystate2: false, // 审核员 未通过审核时订单信息提示显示
        bxdshystate: true,//审核员 审核按钮状态
        fghc:[],//返工耗材
        showType: 'img', // img或vedio申报人上传的是图片还是视频
        popupShow: false, // 顶部弹出popup
        popupText: '',
        cancleDialog: false, // 撤销弹框
        cancleValue: '', // 撤销事由
        imagePreview: false, // 图片预览
        imageIndex: 0, // 图片序列
        images: [], // 图片数组
        bxdInfo: {}, // 报修单详情
        authInfo: {}, // 授权信息
        format: 'YYYY/MM/DD HH:mm', // 时间格式
        evaluate: config.evaluate, // 评价说明
        max: config.evaluate.length, // 长度
        icons: config.icons, // 图标路径
        isQrcode: false, // 是否扫描二维码打开，不是的话没有任何操作
        isEncry: true, // isQrcode为true的情况下是否对相关号码进行加密
        encryPhoneNumber: encryPhoneNumber, // 号码加密
        encryStudentID: encryStudentID, // 学号加密
        encryEmail: encryEmail, // 邮箱加密
        toast: null, // 加载框对象

        // add 20200901
        hcDialog: false, // 耗材弹框
        hc: [], // 耗材
        gs: '', // 工时
        hclist: [],
        showHcListActionSheet: false // 耗材列表上拉菜单
      }
    },
    computed: {
      // 显示撤回按钮
      showCancleBtn() {
        return this.showBxdInfo && (this.bxdInfo.state == 0 || this.bxdInfo.state == 1) // 申报单状态为0和1的时候可以撤回
      },
      // 显示评分区块
      showScore() {
        return this.bxdInfo.state == 2 // 申报单状态必须为2已维修的情况下
      },
      // bxdInfo赋值之后再渲染
      showBxdInfo() {
        return Object.keys(this.bxdInfo).length
      },
      // 未评价
      unevaluated() {
        return this.bxdInfo.state == 2 && !this.bxdInfo.pj // 申报单状态必须为2已维修，评价星级pj为未填的情况下
      },
      // 二维码id，判断是否扫码进入的
      eid() {
        return this.authInfo.eid
      },
      // 内容区显示耗材列表
      showHc() {
        return (this.bxdInfo.state == 2 && this.bxdInfo.hc) || this.hc // 如果报修单为已维修且有耗材，则显示
      }
    },
    async created() {
      this.isQrcode = this.$route.query.hasOwnProperty('qrcode')
      this.authInfo = getAuthInfo()
      if (this.authInfo.sf != 3) { // 审核员sf=3
        this.$router.push('/no-permission')
        return
      }
      await this.getHc()
      this.getBxdDetails()
    },
    methods: {
      /**
       * 获取耗材列表
       */
      async getHc() {
        await HcServlet({
          op: 'selhc'
        }).then(res => {
          if (res && res.obj.hlist) {
            this.hclist = res.obj.hlist.map(item => {
              if(item.xh !== null){
                return {
                  id: item.id,
                  mc: item.mc,
                  name: item.mc + '(' + item.xh +')'+ '(' + item.dw +')',
                  dw: item.dw,
                  xh:item.xh
                }
              }else{
                return {
                  id: item.id,
                  mc: item.mc,
                  name: item.mc + '(' + item.dw +')',
                  dw: item.dw,
                  xh:item.xh
                }
              }
            })
          } else {
            this.$notify({type: 'warning', message: '数据异常', duration: 1000})
          }
        }).catch(err => {
          this.$notify({type: 'error', message: '接口异常或网络中断', duration: 1000})
        })
      },
      /**
       * 获取报修单详情数据
       */
      getBxdDetails() {
        const id = this.$route.params.id
        this.fetchData(id)
      },
      /**
       * 读取接口
       */
      fetchData(id) {
        this.toast = this.$toast({
          type: 'loading',
          message: '加载中',
          duration: 0
        })
        AdminServlet({
          op: 'selbxdbyadmin',
          bid: id
        }).then(response => {
          this.toast.clear()
          if (response.obj.blist && response.obj.blist.length > 0) {
            this.bxdInfo = response.obj.blist[0]
            //审核员审核按钮状态
            let stateParam = sessionStorage.getItem('bxdshystate');
            this.bxdshystate = (getAuthInfo().ybid == this.bxdInfo.shy1) ?
              (this.bxdInfo.shy1state === 0)
              :
              (this.bxdInfo.shy2state === 0) || stateParam
            this.hcAndGsState = this.bxdInfo.hc.length == 0 && this.bxdInfo.gs == '' ? false : true;
            if (this.bxdInfo.hc){
              //耗材数据处理
              let str = this.bxdInfo.hc;
              let length = str.length;
              let fsStart = str.indexOf("返");
              let fgEnd = str.indexOf(":");
              if(fsStart !== -1){
                let hc = str.substring(0,fsStart-1);
                let fghc = str.substring(fgEnd+1,length)
                this.bxdInfo.hc = hc;
                this.formatFghc(fghc)
              }else{
                this.bxdInfo.hc = str;
              }
            }
            this.resetBxdInfo()
          } else {
            this.toast.clear()
            this.$notify.error({
              message: '该工单不存在或接口异常~'
            })
          }
        }).catch(() => {
          if(!this.$route.params.id == undefined){
            this.toast.clear()
            this.$notify.error({
              message: '该工单不存在或接口异常~'
            })
          }
        })
      },
      /**
       * 重置报修单信息
       */
      resetBxdInfo() {
        const me = this
        const bxdInfo = this.bxdInfo
        // 提取报修图片
        let bxdimg = this.$store.getters.config.bxdimg
        let tp = bxdInfo.tp?bxdInfo.tp : ''
        let sp = bxdInfo.sp?bxdInfo.sp : ''
        if (tp.trim() !== '') {
          this.img = true
          this.images = []
          const arr = tp.split('|')
          arr.shift()
          this.images = arr.map(item => {
            return `${bxdimg}/${item}`
          })
        }
        if (sp.trim() !== '') {
          this.video = true
          this.videoUrl = `${bxdimg}/${sp}`
        }

        // 提取报修耗材
        if (this.bxdInfo.hc !== null){
          this.formatHc(copyObj(this.bxdInfo.hc))
        }
        // 提取工时
        this.gs = this.bxdInfo.gs
        // 评价
        bxdInfo.pj = Number(bxdInfo.pj)
        if (bxdInfo.shy1 == this.authInfo.ybid && bxdInfo.shy1state === 1){
          this.authInfo.eid = false
        }else if (bxdInfo.shy2 == this.authInfo.ybid && bxdInfo.shy2state === 1){
          this.authInfo.eid = false
        }

        // 审核员审核状态
        if (bxdInfo.s1) {
          let s1 = getBxdShState(bxdInfo.shy1state)
          bxdInfo.s1.zt = s1.text
          bxdInfo.s1.tag = s1.tag
        }
        if (bxdInfo.s2) {
          let s2 = getBxdShState(bxdInfo.shy2state)
          bxdInfo.s2.zt = s2.text
          bxdInfo.s2.tag = s2.tag
        }

        // 报修单状态，0未派单，1已派单，2已维修，3撤销单，4已验收，5验收不通过
        bxdInfo.state = Number(bxdInfo.state)

        // 添加进度步骤
        const step = {
          active: 0,
          steps: []
        }
        const state = bxdInfo.state

        if (state === 0) { // 申报中，未派单
          step.active = 0
          step1()
        } else if (state === 1) { // 已派单，维修中
          step.active = 1
          step1()
          step2()
        } else if (state === 2) { // 已维修
          //默认验收员为审核员1
          if (this.bxdInfo.shy1state === 1 && this.authInfo.ybid == this.bxdInfo.shy1){
            this.ysr = true
          }
          step.active = 2
          step1()
          step2()
          step3()
        } else if (state === 3) { // 已撤回
          if (this.bxdInfo.j) { // 有接单人信息，说明已经派单，此时撤回属于第3步
            step.active = 2
            step1()
            step2()
            step4()
          } else {
            step.active = 1 // 没有有接单人信息，说明还未派单，此时撤回属于第2步
            step1()
            step4()
          }
        }
        this.bxdInfo = Object.assign({}, this.bxdInfo, {
          step: step
        })

        function step1() {
          const sbsj = me.$moment(me.bxdInfo.sbsj).format(me.format)
          let desc = `<span class="name">${me.bxdInfo.sbr}</span>于${sbsj}提交了维修申报.`
          step.steps.push({
            title: '申报中',
            time: sbsj,
            desc: desc
          })
        }

        function step2() {
          let desc = ''
          let xm = me.bxdInfo.j.xm
          let tel = me.bxdInfo.j.sj
          if (me.bxdInfo.j) {
            desc = tel ? `系统已自动派单给维修师傅<span class="name">${xm}</span>(手机：<a class="tel" href="tel:${tel}">${tel}</a>)，等待处理...`
              : `系统已自动派单给维修师傅<span class="name">${xm}</span>，等待处理...`
          } else {
            desc = '等待管理员指派维修师傅，请耐心等待...'
          }
          step.steps.push({
            title: '维修中',
            time: me.$moment(me.bxdInfo.sbsj).format(me.format),
            desc: desc
          })
        }

        function step3() {
          step.steps.push({
            title: '已完成',
            time: me.bxdInfo.wxsj ? me.$moment(me.bxdInfo.wxsj).format(me.format) : '--',
            desc: '维修工作已完成.'
          })
        }

        function step4() {
          step.steps.push({
            title: '已撤回',
            time: me.bxdInfo.wxsj ? me.$moment(me.bxdInfo.wxsj).format(me.format) : '--',
            desc: '申报已撤回，原因：' + me.bxdInfo.cxsy + '.'
          })
        }
      },
      /**
       * 预览图片
       */
      handleImagePreview(index) {
        this.imagePreview = true
        this.imageIndex = index
      },
      /**
       * 顶部提示，1.2s后自定隐藏
       */
      showPopupTip(text) {
        this.popupShow = true
        this.popupText = text
        setTimeout(() => {
          this.popupShow = false
        }, 1200)
      },
      /**
       * 拨打电话，需要调用易班api指定接口
       */
      handleTel(tel) {
        // window.location.href = `tel:${tel}`
        phone_yb(tel, (error) => {
          this.$notify({
            message: error,
            className: 'my-notify error'
          })
        })
      },
      /**
       * 审核通过
       * @param text
       * @param state 1通过 2不通过
       */
      shyPass(text, state) {
        this.$dialog.alert({
          message: text,
          showCancelButton: true
        }).then(() => {
          ShyServlet({
            op: 'upbxdbyshy', // 调用方法，固定值*
            shyid: this.authInfo.ybid, // 易班id*
            bid: this.bxdInfo.id, // 报修单id*
            shystate: state // 审核情况*，1通过，2不通过
          }).then(res => {
            if (res.status === 'success') {
              //如果审核不通过，则清空显示耗材列表
              if (state == 2){
                this.hc = [];
              }

              this.$toast({
                message: '提交成功',
                icon: this.icons + 'icon_suc@2x.png',
                duration: 1500,
                onClose: () => {
                  this.getBxdDetails()
                }
              })

            } else {
              this.$toast({
                message: '提交失败',
                icon: this.icons + 'tip_info@2x.png',
                duration: 1500
              })
            }
          }).catch(() => {
            this.$toast({
              message: '提交失败',
              icon: this.icons + 'tip_info@2x.png',
              duration: 1500
            })
          })
        }).catch(() => {})
      },

      /**
       * 验收通过
       * @param text
       * @param state 4通过 5不通过
       */
      ysrPass(text, state) {
        this.$dialog.alert({
          message: text,
          showCancelButton: true
        }).then(() => {
          if(state == 5){
            let param = {
              'jid': this.bxdInfo.jid,
              'bid': this.bxdInfo.id
            }
            // 存储值：将对象转换为Json字符串
            sessionStorage.setItem('param', JSON.stringify(param));
            //申请返工，报修类别不能填写
            sessionStorage.setItem('rework','toRework');
            let bxdshystate = true
            sessionStorage.setItem("bxdshystate",bxdshystate)
            this.authInfo.sf = 1;
            this.authInfo.eid = this.bxdInfo.eid;
            //改变当前身份状态，存入cookie
            setAuthInfo(this.authInfo)
            this.$router.push(config.declarePath)
          }else{
            ShyServlet({
              op: 'upbxdbyysr', // 调用方法，固定值*
              shyid: this.authInfo.ybid, // 易班id*
              bid: this.bxdInfo.id, // 报修单id*
              state: state // 审核情况*，4通过，5不通过
            }).then(res => {
              this.ysr = false
              if (res.status === 'success') {
                this.$toast({
                  message: '提交成功',
                  icon: this.icons + 'icon_suc@2x.png',
                  duration: 1500,
                  onClose: () => {
                    this.getBxdDetails()
                  }
                })
              } else {
                this.$toast({
                  message: '提交失败',
                  icon: this.icons + 'tip_info@2x.png',
                  duration: 1500
                })
              }
            })
          }
            }).catch(() => {
            this.$toast({
              message: '提交失败',
              icon: this.icons + 'tip_info@2x.png',
              duration: 1500
            })
          })
      },
      //返工耗材
      formatFghc(hc) {
        hc = copyObj(hc)
        if (this.hclist.length > 0) {
          let hcArr = hc.split('|') // 1-5  6-20
          this.fghc = hcArr.map(v => {
            let item = v.split('-') // item[0]是耗材id，item[1]是耗材数量
            let hcItem = this.hclist.filter(k => k.id == item[0])[0]
            return {
              id: hcItem.id,
              mc: hcItem.mc,
              sl: item[1],
              dw: hcItem.dw,
              xh: hcItem.xh
            }
          })
        }
      },
      /**
       * 根据接口返回格式组装数据
       */
      formatHc(hc) {
        hc = copyObj(hc)
        if (this.hclist.length > 0) {
          let hcArr = hc.split('|') // 1-5  6-20
          this.hc = hcArr.map(v => {
            let item = v.split('-') // item[0]是耗材id，item[1]是耗材数量
            let hcItem = this.hclist.filter(k => k.id == item[0])[0]
            return {
              id: hcItem.id,
              mc: hcItem.mc,
              sl: item[1],
              dw: hcItem.dw,
              xh: hcItem.xh
            }
          })
        }
      },
      /**
       * 取消耗材填写
       */
      cancleHc() {
        this.formatHc(copyObj(this.bxdInfo.hc))
        this.gs = this.bxdInfo.gs
        this.hcDialog = false // 隐藏弹框
      },
      /**
       * 接口读取耗材列表，显示上拉菜单
       */
      async showHcList() {
        this.showHcListActionSheet = true
        if (!this.hclist.length) {
          await this.getHc()
        }
      },
      onSelectHc(item) {
        this.showHcListActionSheet = false
        this.addHc(item)
      },
      /**
       * 添加选中耗材
       */
      addHc(item) {
        let notExist = true
        this.hc.map(inneritem => {
          if (inneritem.id === item.id) {
            notExist = false
          }
        })
        if (notExist) {
          this.hc.push({
            id: item.id,
            mc: item.mc,
            sl: 1,
            dw: item.dw
          })
        }
      },
      /**
       * 移除选中耗材
       */
      removeHc(id) {
        let index = this.hc.findIndex(v => v.id === id)
        this.hc.splice(index, 1)
      },
      /**
       * 选择耗材和工时->确定，提交接口
       */
      completeHcList() {
        if (!this.hc.length) {
          this.showPopupTip('请填写耗材明细')
          return
        }
        let hc = this.hc.map(v => {
          return v.id + '-' + v.sl
        })
        hc = hc.join('|')
        ShyServlet({
          op: 'upbxdhcbyshy', // 调用方法，固定值*
          bid: this.bxdInfo.id, // 报修单id*
          ybid: this.authInfo.ybid, // 易班id*
          hc: hc,	// 所需耗材使用情况
          gs: this.gs // 所需工时
        }).then(res => {
          this.hcDialog = false // 隐藏弹框
          if (res.status === 'success') {
            this.$toast({
              message: '提交成功',
              icon: this.icons + 'icon_suc@2x.png',
              duration: 1500,
              onClose: () => {
                this.getBxdDetails()
              }
            })
          } else {
            this.getBxdDetails()
            this.$toast({
              message: '提交失败',
              icon: this.icons + 'tip_info@2x.png',
              duration: 1500
            })
          }
        }).catch(() => {
          this.hcDialog = false // 隐藏弹框
          this.getBxdDetails()
          this.$toast({
            message: '提交失败',
            icon: this.icons + 'tip_info@2x.png',
            duration: 1500
          })
        })
      }
    }
  }
</script>

<style lang="scss">
  /*
    is-success: 已进行结束
    is-finish: 正在进行
    is-wait: 还未进行
  */

  .el-step__title.is-success,
  .el-step__description.is-success,
  .el-step__description.is-finish {
    color: #fff;
  }

  .el-step__head.is-finish {
    color: #e8ce46;
    border-color: #e8ce46;
  }

  .el-step__title.is-finish {
    color: #FFEF9C;
  }

  .el-step__title.is-wait,
  .el-step__description.is-wait {
    color: rgba(255, 255, 255, .5);
  }

  .van-grid-item__content {
    padding: 0 !important;
  }

  .img-grid {
    [class*=van-hairline]::after {
      border: none;
    }
  }

  a.tel, a.tel:focus, a.tel:hover {
    color: #FFEF9C;
  }

  .score {
    /* element-ui 评分组件样式 */
    .el-rate__icon {
      font-size: 50px;
    }

    .el-rate__text {
      font-size: 30px;
    }
  }

  .evaluate-dialog {
    /* element-ui 评分组件样式 */
    .el-rate__icon {
      font-size: 50px;
    }

    .el-rate__text {
      font-size: 30px;
    }
  }

  .van-dialog {
    border-radius: 32px;
  }

  .van-popup-tip {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f96953;
    font-size: 28px;
    color: #fff;
    height: 100px;
  }

</style>
<style lang="scss" scoped>
  div {
    box-sizing: border-box;
  }

  .main {
    width: 750px;
    height: 100%;
    overflow-x: hidden;
    background: rgba(244, 246, 248, 1);

    &-header {
      width: 750px;
      height: 162px;
      padding: 20px 0;
      // position: sticky;
      // top: 0;
      z-index: 999;
      transition: all .5s;

      .title {
        width: 256px;
        height: 90px;
        float: left;
        font-size: 52px;
        font-family: PingFang SC;
        font-weight: bold;
        line-height: 90px;
        color: rgb(255, 255, 255);
        margin: 12px 0 10px 48px;
      }

      .cancle {
        float: right;
        height: 44px;
        font-size: 32px;
        color: #f3db2f;
        margin: 34px 52px 34px 0;
        font-weight: 400;
        line-height: 44px;
        cursor: pointer;
      }

      .back {
        height: 44px;
        float: right;
        font-size: 32px;
        font-family: PingFang SC;
        font-weight: 400;
        line-height: 44px;
        color: rgb(255, 255, 255);
        cursor: pointer;
        margin: 34px 52px 34px 0;

        a {
          color: #fff;
        }
      }
    }

    &-progress {
      width: 750px;
      height: auto;
      min-height: 400px;
      padding-top: 162px;
      margin-top: -162px;
      background: url("http://yiban.glmc.edu.cn/icons/body_bg@2x.png") no-repeat;
      background-size: cover;

      .score {
        width: 686px;
        background: rgba(10, 132, 67, 1);
        border-radius: 16px;
        margin: 0 32px;
        padding: 10px 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        overflow: hidden;

        .title {
          font-size: 30px;
          font-family: PingFang SC;
          font-weight: 400;
          line-height: 42px;
          color: rgba(255, 255, 255, 1);
        }

        .stars {
          margin: 10px 0 15px;
        }

        .evaluate {
          max-width: 72%;
          line-height: 48px;
          font-size: 24px;
          color: #FFEF9C;
          text-align: center;
          margin: 5px 0;
        }
        .evaluate-add {
          color: #ececec;
        }
      }

      .unevaluated-score {
        flex-direction: row;
        padding: 30px 0;

        .unevaluated-title {
          color: #fff;
          font-size: 30px;
        }

        .unevaluated-stars {
          margin-left: 50px;

          .van-button--warning {
            color: rgba(96, 86, 24, 1);
            border-color: rgba(255, 239, 156, 1);
            background: rgba(255, 239, 156, 1);
          }
        }

        .unevaluated-title-isqrcode {
          font-size: 30px;
          color: rgba(255, 239, 156, 1);
        }
      }

      .progress {
        width: 750px;
        height: auto;
        padding: 40px 0 40px 60px;

        .progress-steps {
          .progress-step {
            flex-basis: 220px !important;

            .title {
              font-size: 32px;
            }

            .date {
              height: 40px;
              font-size: 28px;
              font-family: PingFang SC;
              font-weight: 400;
              line-height: 40px;
              color: rgba(255, 255, 255, .5);
            }

            /deep/ .desc {
              width: 556px;
              font-size: 29px;
              font-family: PingFang SC;
              font-weight: 400;
              line-height: 44px;
              margin-top: 8px;
              color: rgba(255, 255, 255, .9);
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 2;
              overflow: hidden;

              .name {
                color: #fdd460;
                font-weight: bold;
              }
            }
          }
        }
      }
    }

    &-content {
      width: 750px;
      height: auto;
      padding: 60px 48px;
      // background-color: rgba(244, 246, 248, 1);
      background-color: rgba(255, 255, 255, 1);
      border-radius: 32px 32px 0px 0px;
      margin-top: -32px;

      .no-data {
        height: 500px;
      }

      .category {
        height: 56px;
        font-size: 36px;
        font-family: PingFang SC;
        font-weight: 800;
        line-height: 56px;
        color: rgba(16, 175, 90, 1);
      }

      .desc {
        height: auto;
        font-size: 32px;
        font-family: PingFang SC;
        font-weight: 400;
        line-height: 44px;
        color: rgba(74, 88, 96, 1);
        margin-top: 16px;
      }

      .img-grid {
        padding: 40px 10px 0 10px;

        .img-grid-item {
          padding: 0 30px 50px 0;

          .van-grid-item__content {
            padding: 0 !important;

            .image {
              width: 160px;
              height: 160px;
            }
          }
        }
      }

      .container {
        height: auto;

        &-item {
          display: flex;
          margin-bottom: 40px;

          &-left {
            width: 180px;
            font-size: 32px;
            font-family: PingFang SC;
            font-weight: 800;
            line-height: 44px;
            color: rgba(74, 88, 96, 1);
            text-align: left;
          }

           &-right {
            flex: 1;
            margin-left: 30px;
            font-size: 32px;
            font-family: PingFang SC;
            font-weight: 400;
            line-height: 44px;
            color: rgba(74, 88, 96, .8);
            position: relative;

            .my-van-cell {
              padding: 10px 0;
              font-size: 30px;

              .my-tag {
                display: inline-block;
                width: 44px;
                height: 44px;
                line-height: 44px;
                text-align: center;
                font-size: 32px;
              }
            }

            .unit {
                font-size: 28px;
                margin-left: 5px;
              }

            .tel {
              position: absolute;
              top: -20px;
              right: 20px;
              width: 80px;
              height: 80px;
              background: url("http://yiban.glmc.edu.cn/icons/icon_call@2x.png") no-repeat;
              background-size: cover;
            }
          }

          .orange-txt {
            color: #ff8721;
          }

          .waiting-txt {
            color: #1890ff;
          }

          .success-txt {
            color: #67C23A;
          }
        }

        .gap {
          width: 90%;
          height: 1px;
          margin: 40px auto;
          border-top: 1px dashed #ddd;
          box-sizing: border-box;
        }

        .evaluate {
          .container-item-right {
            color: #f90;
          }
        }
      }

      .button {
        &-item {
          margin: 15px 0;
        }

        .select {
          box-shadow: 0 20px 40px rgba(255, 151, 106, 0.3);
        }

        .complete {
          box-shadow: 0px 20px 40px rgba(16, 175, 90, 0.3);
        }
      }
    }

    .hc-dialog {
      display: flex;
      flex-direction: column;
      padding: 10px 20px 0;

      .title {
        font-size: 30px;
        color: rgba(74, 88, 96, 1);
        margin: 15px 10px 15px 15px;
      }

      .desc {
        width: 100%;
        margin-bottom: 20px;

        &-field {
          background: rgba(244, 246, 248, 1);
          border-radius: 32px;
        }

        .select-hc {
          max-height: 36vh;
          overflow: auto;
          .hc {
            height: 52px;
            display: flex;
            align-items: center;
            padding: 0 5px;
            position: relative;
            margin-bottom: 12px;
            .hc-name {
              width: 280px;
              font-size: 26px;
              text-align: center;
              height: 52px;
              line-height: 52px;
              border-radius: 10px;
              background: #fff;
            }
            /deep/.hc-sl {
              display: inline-block;
              margin-left: 20px;
              .van-stepper__minus,
              .van-stepper__plus {
                background: transparent;
              }
            }
            .hc-dw {
              font-size: 28px;
              display: inline-block;
              margin-left: 10px;
            }
            .hc-del {
              font-size: 32px;
              position: absolute;
              right: 20px;
            }
          }
          .button-add {
            margin-top: 5px;
          }
          .button-submit {
            margin-top: 20px !important;
            box-shadow: 0px 20px 40px rgba(16, 175, 90, 0.3);
          }
        }
      }

      .button {
        width: 90%;
        margin: 0 auto;

        &-submit {
          margin: 20px 0;
          box-shadow: 0px 20px 40px rgba(16, 175, 90, 0.3);
          border-radius: 16px;
        }

        &-cancle, &-cancle::before {
          background-color: transparent;
          margin-bottom: 20px;
        }
      }
    }
  }
</style>
