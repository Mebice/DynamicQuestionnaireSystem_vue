<script>
import Swal from 'sweetalert2'
export default {
  data() {
    return {
      formData: {
        answers: {},  // 存储单选和多选题的答案
        qnId: '',
        quId: '',
        selectOptionArr: [],
        personalInfo: {
          name: '',
          phone: '',
          email: '',
          age: ''
        }
      },
      arr: [],
      // user: {
      //   name: "Doe",
      //   phoneNumber: "1234567890",
      //   email: "doe@example.com",
      //   age: 25,
      //   questionnaireId: 42,
      //   questionId: 42,
      //   ans: "Some answer"
      // },
      phoneNumbers: []
    }
  },
  
  mounted() {


    // const storedSelectOptionArr = sessionStorage.getItem('selectOptionArr');
    // if (storedSelectOptionArr) {
    //   this.selectOptionArr = JSON.parse(storedSelectOptionArr);
    //   console.log('sessionStorage selectOptionArr從上一頁:', this.selectOptionArr);
    // } else {
    //   console.log('sessionStorage 中沒有 selectOptionArr');
    //   // 在這裡處理沒有 selectOptionArr 的情況
    // }

    // 從路由查詢中取得相關資訊
    const questionnaireId = this.$route.query.questionnaireId;
    const questionnaire = JSON.parse(this.$route.query.questionnaire);
    const questionList = JSON.parse(this.$route.query.questionList);
    const userStatistics = JSON.parse(this.$route.query.userStatistics);
    // 使用 map 提取 phoneNumber
    this.phoneNumbers = userStatistics.map(user => user.phoneNumber);

    console.log(this.phoneNumbers);
    this.qnId = this.$route.query.questionnaireId;
    this.quId = [];
    for (let i = 0; i < questionList.length; i++) {
      this.quId.push(questionList[i].quId);
    }

    // 將questionnaire和questionList存储到 sessionStorage
    sessionStorage.setItem('questionnaire', JSON.stringify(questionnaire));
    sessionStorage.setItem('questionList', JSON.stringify(questionList));
    sessionStorage.setItem('selectOptionArr', JSON.stringify(this.selectOptionArr));
    // this.selectOptionArr=[]
    //   for(let i = 0 ; i < questionList.length ; i++ ){
    //     let ques = questionList[i]
    //     let obj = Object.assign({},ques,{chooseOptions:[],qnId: this.qnId,quId: this.quId})

    //     this.selectOptionArr.push(obj)
    //   }
    //   // 保存到 sessionStorage
    // sessionStorage.setItem('selectOptionArr', JSON.stringify(this.selectOptionArr));

    // // 檢查 sessionStorage 中的 selectOptionArr
    // console.log('sessionStorage selectOptionArr:', sessionStorage.getItem('selectOptionArr'));

    // console.log(this.selectOptionArr)
    console.log(typeof questionnaire)
    console.log(questionList)


    console.log('Questionnaire ID:', questionnaireId);
    console.log('Questionnaire:', questionnaire);
    console.log('Question List:', questionList);
    console.log('qnId:', this.qnId);
    console.log('quId:', this.quId);
    console.log('Answers:', this.formData.answers);

  },

  updated() {
    this.user = {
      name: this.formData.personalInfo.name,
      phoneNumber: this.formData.personalInfo.phone,
      email: this.formData.personalInfo.email,
      age: this.formData.personalInfo.age,
      questionnaireId: '',
      questionId: '',
      ans: {}
    }
  },



  methods: {

    moveToConfirm() {
      // 驗證姓名、手機、信箱、年齡是否為空
      if (
        !this.formData.personalInfo.name ||
        !this.formData.personalInfo.phone ||
        !this.formData.personalInfo.email ||
        !this.formData.personalInfo.age
      ) {
        Swal.fire({
          title: '請將基本資料填寫完整',
          text: '姓名、手機、信箱、年齡不得為空。',
          icon: 'warning',
          confirmButtonColor: '#3085d6',
          confirmButtonText: '確定'
        });
        return; // 如果有任何一項為空，停止執行
      }

      // 檢查手機號碼格式是否正確
      const phoneRegex = /^09\d{8}$/;
      const inputPhoneNumber2 = this.formData.personalInfo.phone;
      if (!phoneRegex.test(inputPhoneNumber2)) {
        Swal.fire({
          title: '手機號碼格式不正確',
          text: '手機號碼格式應為09開頭的十碼數字。',
          icon: 'warning',
          confirmButtonColor: '#3085d6',
          confirmButtonText: '確定'
        });
        return;
      }

      // 檢查是否有未回答的必填題目
      const unansweredRequiredQuestions = this.checkUnansweredRequiredQuestions();
      if (unansweredRequiredQuestions.length > 0) {
        // 顯示未回答的必填題目的提示
        Swal.fire({
          title: '請填寫必填題目',
          html: `<p>請回答以下必填題目：</p>${unansweredRequiredQuestions.map(q => `<ul style="text-align: left; padding-left: 20px;">${q}</ul>`).join('')}`,
          icon: 'warning',
          confirmButtonColor: '#3085d6',
          confirmButtonText: '確定'
        });
        return;
      }

      // 取得輸入的手機號碼
      const inputPhoneNumber = this.formData.personalInfo.phone;

      // 檢查手機號碼是否存在於 phoneNumbers 陣列中
      const isPhoneNumberUsed = this.phoneNumbers.includes(inputPhoneNumber);

      if (isPhoneNumberUsed) {
        // 如果號碼存在，顯示警告
        Swal.fire({
          title: '警告',
          text: '此手機號碼已經被使用過。',
          icon: 'warning',
          confirmButtonColor: '#3085d6',
          confirmButtonText: '確定'
        });
      } else {
        
        // 將答案不分開存入 selectOptionArr
        this.selectOptionArr = this.formData.answers;

        // 將 selectOptionArr 存入 sessionStorage
        sessionStorage.setItem('selectOptionArr', JSON.stringify(this.selectOptionArr));


        // 处理 answers 结构
        const transformedAnswers = [];
        for (const quId in this.formData.answers) {
          const ans = this.formData.answers[quId];
          if (Array.isArray(ans)) {
            // 如果 ans 是数组，拆分成多个对象
            ans.forEach(singleAns => {
              transformedAnswers.push({ qnId: this.qnId, quId: (parseInt(quId) + 1).toString(), ans: singleAns });
            });
          } else {
            // 否则直接添加到 transformedAnswers
            transformedAnswers.push({ qnId: this.qnId, quId: (parseInt(quId) + 1).toString(), ans });
          }
        }
        this.formData.answers = transformedAnswers;

        // 將formData存储到 sessionStorage
        sessionStorage.setItem('formData', JSON.stringify(this.formData));

        this.$router.push('/ForestageConfirm');
      }
    },

    checkUnansweredRequiredQuestions() {
      const unansweredQuestions = [];
      const questionList = JSON.parse(this.$route.query.questionList);
      questionList.forEach((item, index) => {
        if (item.necessary && !this.formData.answers[index]) {
          unansweredQuestions.push(`${item.quId}. ${item.qTitle}`);
        }
      });
      return unansweredQuestions;
    },


    test(index, option) {
      // 確保為每個問題創建一個獨立的數組屬性
      if (!this.formData.answers[index]) {
        this.formData.answers[index] = [];
      }

      // 檢查是否已經存在於答案中，是則移除，否則加入
      const indexInAnswers = this.formData.answers[index].indexOf(option);
      if (indexInAnswers === -1) {
        this.formData.answers[index].push(option);
      } else {
        this.formData.answers[index].splice(indexInAnswers, 1);
      }

      // 即時更新 session 中的 formData
      sessionStorage.setItem('formData', JSON.stringify(this.formData));
    },
    cancelPage() {
      this.$router.go(-1);
    },
    // 返回
    moveToPreviousPage() {
      Swal.fire({
        title: '取消填寫?',
        text: `是否取消本次填寫的問卷?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: '是',
        cancelButtonText: '否'
      }).then((result) => {         //點擊確認按鈕後
        if (result.isConfirmed) {
          
          // 是，確認返回
          this.$router.go(-1);
        }
      })

    }


  }

}
</script>

<template>
    <div class="bgArea">
      <!-- <h1>{{ $route.query.questionnaireId }}</h1> -->
      <!-- <p>{{ $route.query.userStatistics }}</p> -->
      <!-- <p>{{ $route.query.questionnaire }}</p>
  <p>{{ $route.query.questionList }}</p> -->
      <!-- <p>{{ this.qnId }}</p> -->
      <!-- <p>{{ this.quId }}</p> -->

      <!-- 顯示問卷基本信息 -->
      <div class="titleArea">
        <p>{{ JSON.parse($route.query.questionnaire).startDate + ' ~ ' +
          JSON.parse($route.query.questionnaire).endDate }}</p>
        <h2>{{ JSON.parse($route.query.questionnaire).title }}</h2>
        <p>{{ JSON.parse($route.query.questionnaire).description }}</p>
      </div>
      <!-- 個人資料 -->
      <div class="infoArea">
        <div class="personalInfoContentArea">
          <div class="infoTop">基本資料</div>
          <div class="personalInfoContent">
            <label for="">姓名</label>
            <input type="text" v-model="formData.personalInfo.name">
            <label for="">手機</label>
            <input type="text" v-model="formData.personalInfo.phone">
          </div>
          <div class="personalInfoContent">
            <label for="">信箱</label>
            <input type="text" v-model="formData.personalInfo.email">

            <label for="">年齡</label>
            <input type="text" v-model="formData.personalInfo.age">
          </div>
        </div>
      </div>
      <div class="questionListArea">
        <div class="questionList" v-for="(item, index) in JSON.parse($route.query.questionList) " :key="index">
          <div class="questionListInside">
            <div class="qTitleAndNecessary">
              <p>{{ item.quId + '. ' + item.qTitle + ' (' + item.optionType + ')' }}</p>
              <span v-if="item.necessary" style="color: red;font-size:10pt">*[必填]</span>
            </div>
            <!-- <p><strong>quId</strong>{{ item.quId }}</p>
          <p><strong>問題：</strong>{{ item.qTitle }}</p>
          <p><strong>類型：</strong>{{ item.optionType }}</p>
          <p><strong>必填：</strong>{{ item.necessary ? '是' : '否' }}</p> -->

            <!-- 根據問題類型呈現選項 -->
            <div v-for="(option, optionIndex) in item.option.split(';')" :key="optionIndex">
              <!-- 使用 v-if 和 v-else 來區分單選和多選 -->
              <input v-if="item.optionType === '單選'" type="radio" :name="'question_' + index" :value="option"
                v-model="formData.answers[index]">
              <input v-else type="checkbox" :id="'question_' + index + '_' + optionIndex" :value="option"
                @change="test(index, option)"
                :checked="formData.answers[index] && formData.answers[index].includes(option)">

              <label class="optionText" :for="'question_' + index + '_' + optionIndex">
                {{ option }}
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- <p><strong>當前選擇答案 formData.answers：</strong>{{ formData.answers }}</p> -->
      <i class="fa-solid fa-rotate-left" @click="moveToPreviousPage"></i>
      <i class="fa-solid fa-arrow-right" @click="moveToConfirm"></i>
    </div>
</template>

<style lang="scss" scoped>
$maincolor: #3F6148;

.bgArea {
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f4f4ed;


  .titleArea {
    width: 60%;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #ffffff;
    border-radius: 10px;
    box-shadow: 0px 0px 8px 1px rgba(0, 0, 0, 0.28);
    padding-top: 15px;
    margin: 2% 0;
    color: $maincolor;
    font-weight: 700;

  }

  .infoArea {
    width: 60%;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0px 0px 8px 1px rgba(0, 0, 0, 0.28);
    padding: 2% 0 2% 0;
    margin-bottom: 2%;
    color: $maincolor;
    font-weight: 700;


    .infoTop {
      width: 100%;
      text-align: center;
      margin: 10px 0;
    }

    .personalInfoContentArea {
      width: 93%;
      display: flex;
      flex-direction: column;
      align-items: center;
      border: 2px solid #ede9e6;
      border-radius: 10px;


      .personalInfoContent {
        margin: 0 -10px 0 20px;
        padding: 0 0 3% 0;

        input {
          width: 250px;
          margin: 0 30px 0 10px;
          padding-left: 5px;
          border: 1.5px solid $maincolor;
          border-radius: 10px;
        }

      }
    }
  }

  .questionListArea {
    width: 60%;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2% 0 0 0;
    border-radius: 10px;
    box-shadow: 0px 0px 8px 1px rgba(0, 0, 0, 0.28);
    margin-bottom: 3%;
    color: $maincolor;
    font-weight: 700;

    .questionList {
      width: 93%;
      background-color: #fff;
      border-radius: 10px;
      margin-bottom: 3%;
      border: 2px solid #ede9e6;

      .questionListInside {
        padding: 2% 10% 2% 10%;

        .qTitleAndNecessary {
          display: flex;
          margin: 0 0 -10px 0;
        }

        .optionText {
          margin-left: 1%;
        }
      }
    }
  }

  .fa-rotate-left {
    color: rgba(161, 158, 158, 0.804);
    background-color: rgba(211, 211, 211, 0.804);
    font-size: 20pt;
    margin-bottom: 50px;
    position: fixed;
    left: 100px;
    bottom: 10px;
    transition: all 0.5s ease;
    border-radius: 50%;
    padding: 12px;

    &:hover {
      background-color: rgba(143, 143, 143, 0.804);
      cursor: pointer;
    }

    /* 使用伪元素添加文字 */
    &::after {
      content: '返回';
      color: white;
      font-size: 10pt;
      display: block;
      position: absolute;
      top: 50%;
      /* 相对于父元素垂直居中 */
      left: 50%;
      /* 相对于父元素水平居中 */
      transform: translate(-50%, -50%);
      /* 平移并旋转文字 */
      opacity: 0;
      /* 初始状态透明 */
      transition: opacity 0.3s ease;
      /* 添加过渡效果 */
      white-space: nowrap;
      /* 防止文字换行 */
    }

    &:hover::after {
      opacity: 1;
    }
  }

  .fa-arrow-right {
    color: rgba(161, 158, 158, 0.804);
    background-color: rgba(211, 211, 211, 0.804);
    font-size: 20pt;
    margin-bottom: 50px;
    position: fixed;
    right: 100px;
    bottom: 10px;
    transition: all 0.5s ease;
    border-radius: 50%;
    padding: 12px;

    &:hover {
      background-color: rgba(143, 143, 143, 0.804);
      cursor: pointer;
    }

    /* 使用伪元素添加文字 */
    &::after {
      content: '下一頁';
      color: white;
      font-size: 10pt;
      display: block;
      position: absolute;
      top: 50%;
      /* 相对于父元素垂直居中 */
      left: 50%;
      /* 相对于父元素水平居中 */
      transform: translate(-50%, -50%);
      /* 平移并旋转文字 */
      opacity: 0;
      /* 初始状态透明 */
      transition: opacity 0.3s ease;
      /* 添加过渡效果 */
      white-space: nowrap;
      /* 防止文字换行 */
    }

    &:hover::after {
      opacity: 1;
    }
  }
}
</style>