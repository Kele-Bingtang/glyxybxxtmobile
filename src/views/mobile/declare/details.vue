<template>
  <div class="main" ref="main">
    <div class="main-header" ref="main-header">
      <div class="title" ref="title">申报单</div>
      <div class="back" ref="back" @click="$router.go(-1)">返回</div>
      <div v-if="eid && showCancleBtn" class="cancle" @click="cancleDialog = true">撤回</div>
    </div>
    <div class="main-progress">
      <!--显示分数-->
      <template v-if="showScore">
        <!--已维修但是未评价-->
        <template v-if="unevaluated">
          <div class="unevaluated-score score">
            <!--如果是扫码进入，可以进行评分-->
            <template v-if="eid">
              <div class="unevaluated-title">请为本次维修服务评分</div>
              <div class="unevaluated-stars">
                <van-button class="unevaluated btn" type="warning" round size="small" @click="evaluateDialog = true">去评分
                </van-button>
              </div>
            </template>
            <!--否则只提示未评分-->
            <template v-else>
              <div class="unevaluated-title-isqrcode">未评分</div>
            </template>
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
          <div v-show="video" class="videoBox">
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
              <div class="container-item-right">{{ bxdInfo.j.yx }}</div>
            </div>
<!--            <div class="container-item">-->
<!--              <div class="container-item-left">耗材：</div>-->
<!--              <div class="container-item-right gs">-->
<!--                <van-cell-group>-->
<!--                  <van-cell-->
<!--                    class="my-van-cell"-->
<!--                    v-for="item in hc"-->
<!--                    :key="item.id"-->
<!--                    :title="item.mc">-->
<!--                    <template #extra>-->
<!--                      <span class="my-tag orange-txt">{{item.sl}}</span>-->
<!--                      <span class="unit orange-txt">{{item.dw}}</span>-->
<!--                    </template>-->
<!--                  </van-cell>-->
<!--                </van-cell-group>-->
<!--              </div>-->
<!--            </div>-->
<!--            <div v-if="fghc.length >0" class="container-item">-->
<!--              <div  class="container-item-left">返工耗材：</div>-->
<!--              <div class="container-item-right gs">-->
<!--                <van-cell-group>-->
<!--                  <van-cell-->
<!--                    class="my-van-cell"-->
<!--                    v-for="item in fghc"-->
<!--                    :key="item.id"-->
<!--                    :title="item.mc">-->
<!--                    <template #extra>-->
<!--                      <span  v-if="item.xh" class="hcxh orange-txt">{{item.xh}}</span>-->
<!--                      <span class="my-tag orange-txt">{{item.sl}}</span>-->
<!--                      <span class="unit orange-txt">{{item.dw}}</span>-->
<!--                    </template>-->
<!--                  </van-cell>-->
<!--                </van-cell-group>-->
<!--              </div>-->
<!--            </div>-->
<!--            <div class="container-item">-->
<!--              <div class="container-item-left">工时：</div>-->
<!--              <div class="container-item-right orange-txt">-->
<!--                <span v-if="hc">{{bxdInfo.gs}} </span>-->
<!--                <span v-else>&#45;&#45;</span>-->
<!--              </div>-->
<!--            </div>-->
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
          <template v-if="eid && bxdInfo.pj && !bxdInfo.pjzj">
            <van-button class="button-item warning" type="warning" size="large" round @click.prevent="evaluateAddDialog = true">追加评价</van-button>
          </template>
        </div>
        <div v-if="!enterByWebEwm"
             class="button">
          <template v-if="eid && bxdInfo.fgts>0 && bxdInfo.state == 2 || bxdInfo.state == 4">
            <el-collapse>
              <el-collapse-item title="返工说明">
                <div>您本次报修单的返工天数还剩余：<span>{{bxdInfo.fgts}}</span>天，若出现问题，请申请返工或联系后勤处</div>
              </el-collapse-item>
            </el-collapse>
            <van-button class="button-item primary" type="warning" size="large" round @click="toRework">我要返工</van-button>
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

    <!--评价评分-->
    <van-dialog
      v-if="!enterByWebEwm"
      v-model="evaluateDialog"
      :show-confirm-button="false"
    >
      <div class="evaluate-dialog" slot="default">
        <div class="title">评价本次维修服务</div>
        <div class="stars">
          <el-rate
            v-model="evaluateValue"
            show-text
            :max="max"
            :texts="evaluate"
            text-color="#ff9900">
          </el-rate>
        </div>
        <div class="desc">
          <van-field
            v-model="evaluateDesc"
            class="desc-field"
            type="textarea"
            placeholder="请输入评价内容"
            rows="3"
            autosize
          />
        </div>
        <div class="button">
          <van-button class="button-submit" type="primary" size="large" @click="handleEvaluate">提交</van-button>
          <van-button class="button-cancle" size="large" @click="evaluateDialog = false">取消</van-button>
        </div>
      </div>
    </van-dialog>

    <!--追加评价-->
    <van-dialog
      v-if="!enterByWebEwm"
      v-model="evaluateAddDialog"
      :show-confirm-button="false"
    >
      <div class="evaluate-dialog" slot="default">
        <div class="title">追加评价</div>
        <div class="desc">
          <van-field
            v-model="evaluateAddDesc"
            class="desc-field"
            type="textarea"
            placeholder="请输入评价内容"
            rows="3"
            autosize
          />
        </div>
        <div class="button">
          <van-button class="button-submit" type="primary" size="large" :disabled="!evaluateAddDesc" @click="handleAddEvaluate">提交</van-button>
          <van-button class="button-cancle" size="large" @click="evaluateAddDialog = false">取消</van-button>
        </div>
      </div>
    </van-dialog>

    <!--弹框提示 撤回报修单-->
    <van-dialog
      v-if="!enterByWebEwm"
      v-model="cancleDialog"
      :show-confirm-button="false"
    >
      <div class="evaluate-dialog" slot="default">
        <div class="title">撤回此次维修申请</div>
        <div class="desc">
          <van-field
            v-model="cancleValue"
            class="desc-field"
            type="textarea"
            placeholder="填写撤回事由"
            rows="3"
            autosize
          />
        </div>
        <div class="button">
          <van-button class="button-submit" type="primary" :disabled="!cancleValue" size="large" @click="handleCancle">
            撤回
          </van-button>
          <van-button class="button-cancle" size="large" @click="cancleDialog = false">取消</van-button>
        </div>
      </div>
    </van-dialog>

    <!--顶部弹出popup-->
    <van-popup
      v-model="popupShow"
      class="van-popup-tip"
      position="top"
    >
      <van-icon name="warning-o" style="margin-right: 6px;"/>
      {{popupText}}
    </van-popup>

  </div>
</template>

<script>
  import {AdminServlet} from '@/api/AdminServlet'
  import {BxdServlet} from '@/api/BxdServlet'
  import {HcServlet} from '@/api/HcServlet'
  import {encryPhoneNumber, encryStudentID, encryEmail} from '@/utils/encryption'
  import {phone_yb} from '@/utils/yb_h5'
  import config from '@/config'
  import noDataShow from '@/mobile/noDataShow'
  import {getBxdShState, copyObj} from "../../../utils/common";
  import {getAuthInfo} from "../../../utils/cookie";

  export default {
    name: 'DeclareDetails',
    components: {noDataShow},
    data() {
      return {
        enterByWebEwm: false,
        fghc:[],//返工耗材
        showType: 'img', // img或video申报人上传的是图片还是视频
        img: false,
        video: false,
        videoUrl: '',
        popupShow: false, // 顶部弹出popup
        popupText: '',
        evaluateDialog: false, // 评论弹框
        cancleDialog: false, // 撤销弹框
        cancleValue: '', // 撤销事由
        evaluateValue: 0, // 用户评价星级
        evaluateDesc: '', // 用户评价文字描述
        evaluateAddDialog: false, // 追加评论弹框
        evaluateAddDesc: '', // 用户追加评价文字描述
        imagePreview: false, // 图片预览
        imageIndex: 0, // 图片序列
        images: [], // 图片数组
        bxdInfo: {}, // 报修单详情
        authInfo: {}, // 授权信息
        format: 'YYYY/MM/DD HH:mm', // 时间格式
        evaluate: config.evaluate, // 评价说明
        max: config.evaluate.length, // 长度
        icons: config.icons, // 图标路径
        isEncry: true, // isQrcode为true的情况下是否对相关号码进行加密
        encryPhoneNumber: encryPhoneNumber, // 号码加密
        encryStudentID: encryStudentID, // 学号加密
        encryEmail: encryEmail, // 邮箱加密
        toast: null, // 加载框对象

        // add 20200901
        hc: [], // 耗材
        gs: '', // 工时
        hclist: [] // 耗材接口列表
      }
    },
    computed: {
      // 显示撤回按钮
      showCancleBtn() {
        return this.showBxdInfo && (this.bxdInfo.state === 0 || this.bxdInfo.state === 1)
      },
      // 显示评分区块
      showScore() {
        // return this.bxdInfo.state === 2 // 申报单状态必须为2已维修的情况下
        return this.bxdInfo.state === 4 // 申报单状态必须为4已验收的情况下
      },
      // bxdInfo赋值之后再渲染
      showBxdInfo() {
        return Object.keys(this.bxdInfo).length
      },
      // 未评价
      unevaluated() {
        // return this.bxdInfo.state === 2 && !this.bxdInfo.pj // 申报单状态必须为2已维修，评价星级pj为未填的情况下
        return this.bxdInfo.state === 4 && !this.bxdInfo.pj // 申报单状态必须为4已验收，评价星级pj为未填的情况下
      },
      // 二维码id，判断是否扫码进入的
      eid() {
        return this.authInfo.eid
      }
    },
    async created() {
      this.authInfo = getAuthInfo()
      if (this.authInfo.sf != 1) {
        this.$router.push('/no-permission')
      }
      await this.getHc()
      this.getBxdDetails()
      if(localStorage.getItem("enterByWebEwm") == "true"){
        this.enterByWebEwm = true;
      }
    },
    methods: {
      /**
       * 获取耗材列表
       */
      async getHc() {
        await HcServlet({
          op: 'selhc'
        }).then(res => {
          if (res.obj && res.obj.hlist) {
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
            this.$notify({ type: 'warning', message: '数据异常', duration: 1000 })
          }
        }).catch(err => {
          this.$notify({ type: 'error', message: '接口异常或网络中断', duration: 1000 })
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
          }
        }).catch(() => {
          if(!this.$route.params.id == undefined){
            this.toast.clear()
            this.$elnotify.error({
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
        if (tp.trim() !== ''){
          this.img = true
          this.images = []
          const arr = tp.split('|')
          arr.shift()
          this.images = arr.map(item => {
            return `${bxdimg}/${item}`
          })
        }
        if (sp.trim() !== ''){
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

        // 报修单状态，0未派单，1已派单，2已维修，3撤销单，4已验收
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
        } else if (state === 2) { // 已维修 还没有结束 只有验收了才是结束
          step.active = 1
          step1()
          step2()
        } else if( state === 4) {  //已验收
          step.active = 4
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
        }else if (state === 5){ // 验收未通过
          step.active = 1;
          step1();
          step2();
        }
        this.bxdInfo = Object.assign({}, this.bxdInfo, {
          step: step
        })

        function step1() {
          const sbsj = me.$moment(me.bxdInfo.sbsj).format(me.format)
          let desc = `您于${sbsj}提交了维修申报.`
          step.steps.push({
            title: '申报中',
            time: sbsj,
            desc: desc
          })
        }

        function step2() {
          let desc;
          let title = '维修中';
          if (me.bxdInfo.j) {
            let xm = me.bxdInfo.j.xm
            let tel = me.bxdInfo.j.sj

            if (me.isEncry) { // 扫描二维码打开的情况下，加密电话并且不能拨打
              desc = tel ? `系统已自动派单给维修师傅<span class="name">${xm}</span>(手机：<a class="tel">${encryPhoneNumber(tel)}</a>)，等待处理...`
                : `系统已自动派单给维修师傅<span class="name">${xm}</span>，等待处理...`;
              if(me.bxdInfo.state == 2 || me.bxdInfo.state == 4) {
                desc = '当前订单已完成修理，等待验收，如出现问题，可以申请返工。'
                title = '已维修';
              }else if(me.bxdInfo.state == 5){
                desc = '当前订单已完成修理，但验收未通过。';
                title = '未通过';
              }

            }else {
              desc = tel ? `系统已自动派单给维修师傅<span class="name">${xm}</span>(手机：<a class="tel" href="tel:${tel}">${tel}</a>)，等待处理...`
                : `系统已自动派单给维修师傅<span class="name">${xm}</span>，等待处理...`;
              if(me.bxdInfo.state == 2 || me.bxdInfo.state == 4) {
                desc = '当前订单已完成修理，等待验收，如出现问题，可以申请返工。'
                title = '已维修';
              }else if(me.bxdInfo.state == 5){
                desc = '当前订单已完成修理，但审核员验收未通过。';
                title = '未通过';
              }
            }
          } else {
            desc = '等待管理员指派维修师傅，请耐心等待...'
          }
          step.steps.push({
            title: title,
            time: me.$moment(me.bxdInfo.sbsj).format(me.format),
            desc: desc
          })
        }

        function step3() {
          step.steps.push({
            title: '已验收',
            time: me.bxdInfo.wxsj ? me.$moment(me.bxdInfo.wxsj).format(me.format) : '--',
            desc: '维修工作已完成，如有问题请返工.'
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
       * 图片预览
       */
      handleImagePreview(index) {
        this.imagePreview = true
        this.imageIndex = index
      },
      /**
       * 评价
       */
      handleEvaluate() {
        if (!this.evaluateValue) {
          this.showPopupTip('请选择星级')
          return
        }
        BxdServlet({
          op: 'upbxdbysbr', // 调用方法，固定值* , 同上方法，单传递参数不同
          xh: this.authInfo.xh, // 学号*，因后台没有session可以直接获取了，需要前台传递
          bid: this.bxdInfo.id, // 报修单ID*
          pj: this.evaluateValue, // 评价星级*
          pjnr: this.evaluateDesc // 评价内容
        }).then(() => {
          this.$toast({
            message: '评价已提交',
            icon: this.icons + 'icon_suc@2x.png',
            duration: 1500,
            onClose: () => {
              this.evaluateDialog = false
              this.evaluateValue = 0
              this.evaluateDesc = ''
              this.getBxdDetails()
            }
          })
        }).catch(() => {
          this.$toast({
            message: '评价失败',
            icon: this.icons + 'tip_info@2x.png',
            duration: 1500
          })
        })
      },
      /**
       * 追加评价
       */
      handleAddEvaluate() {
        this.evaluateAddDesc = this.evaluateAddDesc.replace(/(^\s*)|(\s*$)/g, '')
        if (!this.evaluateAddDesc) {
          this.showPopupTip('请输入评价内容')
          return
        }
        BxdServlet({
          op: 'upbxdbysbr', // 调用方法，固定值* , 同上方法，单传递参数不同
          xh: this.authInfo.xh, // 学号*，因后台没有session可以直接获取了，需要前台传递
          bid: this.bxdInfo.id, // 报修单ID*
          pjzj: this.evaluateAddDesc // 评价内容
        }).then(() => {
          this.$toast({
            message: '评价已提交',
            icon: this.icons + 'icon_suc@2x.png',
            duration: 1500,
            onClose: () => {
              this.evaluateAddDialog = false
              this.evaluateAddDesc = ''
              this.getBxdDetails()
            }
          })
        }).catch(() => {
          this.$toast({
            message: '评价失败',
            icon: this.icons + 'tip_info@2x.png',
            duration: 1500
          })
        })
      },
      /**
       * 申请返工
       */
      toRework() {
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
        this.$router.push(config.declarePath)
      },
      /**
       * 撤回申报
       */
      handleCancle() {
        BxdServlet({
          op: 'upbxdbysbr', // 调用方法，固定值* , 同上方法，单传递参数不同
          xh: this.authInfo.xh, // 学号*，因后台没有session可以直接获取了，需要前台传递
          bid: this.bxdInfo.id, // 报修单ID*
          cxsy: this.cancleValue // 撤销事由
        }).then(() => {
          this.cancleDialog = false
          this.$toast({
            message: '已撤回申报',
            icon: this.icons + 'icon_suc@2x.png',
            duration: 1500,
            onClose: () => {
              this.getBxdDetails()
              this.$store.dispatch('sbr/getBxdList')
            }
          })
        }).catch(() => {
          this.$toast({
            message: '撤回失败',
            icon: this.icons + 'tip_info@2x.png',
            duration: 1500
          })
        })
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
      background: url("~@/assets/section/body_bg@2x.png") no-repeat;
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
        justify-content: space-around;
        padding: 0.4rem 0;

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

      .videoBox {
        width: 100%;
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

              .hcxh{
                height: 44px;
                line-height: 44px;
                text-align: center;
                font-size: 32px;
              }
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
            .orange-txt {
              color: #ff8721;
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
          margin: 25px 0 15px;
        }
        .select {
          box-shadow: 0 20px 40px rgba(255, 151, 106, 0.3);
        }
        .complete {
          box-shadow: 0 20px 40px rgba(16, 175, 90, 0.3);
        }
        .warning {
          box-shadow: 0 20px 40px rgba(214, 134, 100, 0.6);
        }
      }
    }

    .evaluate-dialog {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .title {
        font-size: 30px;
        color: rgba(74, 88, 96, 1);
        margin: 50px 160px 50px;
      }

      .stars {
        margin: 0 0 50px;
      }

      .desc {
        width: 526px;
        margin-bottom: 30px;

        &-field {
          background: rgba(244, 246, 248, 1);
          border-radius: 32px;
        }
      }

      .button {
        width: 526px;

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
