<script>
import moveToPrevious from '../components/moveToPrevious.vue';
export default {
    data() {
        return {
            selectedUser: {
                name: '',
                phoneNumber: '',
                email: '',
                age: '',
            },
            userStatistics: [],
            questionList: [],
        }
    },
    components: {
        moveToPrevious
    },
    created() {
        // 從路由查詢中取得相關資訊
        //使用者資料
        const selectedUser = JSON.parse(this.$route.query.user);
        //使用者資料+選項答案
        const userStatistics = JSON.parse(this.$route.query.userStatistics);
        //問卷
        const questionnaire = JSON.parse(this.$route.query.questionnaire);
        //題目
        const questionList = JSON.parse(this.$route.query.questionList);

        // 將使用者資訊綁定到 data 中的變數
        this.selectedUser = {
            name: selectedUser.name || '',
            phoneNumber: selectedUser.phoneNumber || '',
            email: selectedUser.email || '',
            age: selectedUser.age || '',
        };

        // 將問題列表綁定到 data 中的變數
        this.questionList = questionList.map(item => {
            // 添加 selectedOptions 屬性，初始值為空陣列
            return { ...item, selectedOptions: [] };
        });

        // 初始化選項的選中狀態
        this.initOptions(userStatistics);
    },
    methods: {

        // 初始化選項的選中狀態
        initOptions(userStatistics) {
            console.log('userStatistics:', userStatistics);

            // 遍歷 userStatistics 中的每一條記錄
            userStatistics.forEach(entry => {
                const questionId = entry.questionId;
                const ans = entry.ans;

                console.log('questionId:', questionId, 'ans:', ans);

                // 在 questionList 中找到對應的問題
                const question = this.questionList.find(item => item.quId === questionId);

                console.log('question:', question);

                if (question) {
                    console.log('Before initialization - selectedOptions:', question.selectedOptions);

                    // 將多選的 ans 字串轉換為陣列
                    const ansArray = ans.split(';');

                    // 找到對應的問題後，更新問題的選中狀態
                    if (question.optionType === '單選') {
                        question.selectedOption = ans;
                    } else if (question.optionType === '多選') {
                        console.log('ansArray:', ansArray);
                        // 將選中的每個選項添加到 selectedOptions 中
                        ansArray.forEach(option => {
                            question.selectedOptions.push(option);
                        });
                    }

                    console.log('After initialization - selectedOptions:', question.selectedOptions);
                }
            });
        },

    },
}

</script>

<template>
    <div class="bgArea">
        <moveToPrevious/>
        <!-- <p>{{ this.$route.query.user }}</p>
        <p>{{ this.$route.query.userStatistics }}</p>
        <p>{{ this.$route.query.questionnaire }}</p>
        <p>{{ this.$route.query.questionList }}</p> -->
        <div class="titleArea">
            <p>{{ JSON.parse($route.query.questionnaire).startDate + ' ~ ' +
                JSON.parse($route.query.questionnaire).endDate }}</p>
            <h2>{{ JSON.parse($route.query.questionnaire).title }}</h2>
            <p>{{ JSON.parse($route.query.questionnaire).description }}</p>
        </div>
        <div class="infoArea">

            <div class="personalInfoContentArea">
                <div class="infoTop">基本資料</div>

                <div class="personalInfoContent">
                    <label for="">姓名</label>
                    <input type="text" id="name" v-model="selectedUser.name" :disabled="true">

                    <label for="">手機</label>
                    <input type="text" id="phoneNumber" v-model="selectedUser.phoneNumber" :disabled="true">
                </div>
                <div class="personalInfoContent">
                    <label for="">信箱</label>
                    <input type="text" id="email" v-model="selectedUser.email" :disabled="true">

                    <label for="">年齡</label>
                    <input type="text" id="age" v-model="selectedUser.age" :disabled="true">
                </div>
            </div>
        </div>

        <!-- 顯示問卷中的每一題 -->
        <div class="questionListArea">
            <div class="questionList" v-for="(item, index) in questionList" :key="index">
                <div class="questionListInside">
                    <div class="qTitleAndNecessary">
                        <p>{{ item.quId + '. ' + item.qTitle  + ' (' +item.optionType + ')'}}</p>
                        <span v-if="item.necessary" style="color: red;font-size:10pt">*[必填]</span>
                    </div>
                    <!-- <p><strong>類型：</strong>{{ item.optionType }}</p>
            <p><strong>必填：</strong>{{ item.necessary ? '是' : '否' }}</p>

            <p>Selected Options: {{ item.selectedOptions }}</p>
            <p>Selected Option: {{ item.selectedOption }}</p> -->
                    <!-- 顯示問題的選項 -->
                    <div v-for="(option, optionIndex) in item.option.split(';')" :key="optionIndex">
                        <input v-if="item.optionType === '單選'" type="radio" :name="'question_' + index" :value="option"
                            :checked="item.selectedOption === option" disabled>
                        <input v-else type="checkbox" :id="'question_' + index + '_' + optionIndex" :value="option"
                            :checked="item.selectedOptions && item.selectedOptions.includes(option)" disabled>
                        <label class="optionText" :for="'question_' + index + '_' + optionIndex"
                            :class="{ 'checked': item.selectedOption === option || item.selectedOptions && item.selectedOptions.includes(option) }">
                            {{ option }}
                        </label>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<style lang="scss" scoped>
$maincolor: #A4804C;

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
        color: #6e4e23;
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
        color: #6e4e23;
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
        color: #6e4e23;
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

                .checked::before {
                    content: '\2713';
                    /* Unicode 符號表示打勾 */
                    color: green;
                    /* 綠色 */
                    font-weight: bold;
                    position: absolute;
                    left: 29.5%;
                }

                .optionText {
                    margin-left: 3%;
                }
            }

        }
    }
}
</style>