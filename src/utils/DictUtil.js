import {Dict} from '@/api/Dict'

//获得详细报修类别
export function getxxBxlb(code) {
  Dict({
    "code" : code
  }).then(res => {
    if(res.obj && res.obj.dictitem){
      return res.obj.dictitem
    }
  }).catch(err => {
    this.toast.clear()
    this.$elnotify.error({
      message: '字典接口异常~'
    })
  });
}
