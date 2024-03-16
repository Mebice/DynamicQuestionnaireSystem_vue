<script>
import Chart from 'chart.js/auto';
import MoveToPrevious from '../components/moveToPrevious.vue';
export default {
    data() {
        return {
            userStatistics: [],  // 從路由中獲取的使用者統計數據
        };
    },
    components: {
        MoveToPrevious
    },
    mounted() {
        // 讀取使用者統計數據
        this.userStatistics = JSON.parse(this.$route.query.userStatistics || '[]');

        // 獲取 query 中的 questionList 參數
        const queryQuestionnaire = this.$route.query.questionnaire;
        // 將 JSON 字串轉換為對象
        const questionnaire = JSON.parse(queryQuestionnaire);
        console.log(questionnaire);


        // 獲取 query 中的 questionList 參數
        const queryQuestionList = this.$route.query.questionList;
        // 將 JSON 字串轉換為對象
        const questionList = JSON.parse(queryQuestionList);
        console.log(questionList);

        // 確保DOM中存在圖表的容器元素
        this.$nextTick(() => {
            // 根據使用者統計數據生成圓餅圖和長條圖
            this.generateCharts();
        });
    },
    methods: {
        // 根據 questionId 將使用者統計數據分組
        groupByQuestionId(data) {
            const groupedData = {};
            data.forEach(entry => {
                if (!groupedData[entry.questionId]) {
                    groupedData[entry.questionId] = [];
                }
                groupedData[entry.questionId].push(entry);
            });
            return groupedData;
        },
        // 根據使用者統計數據生成圓餅圖和長條圖
        generateCharts() {
            const groupedData = this.groupByQuestionId(this.userStatistics);

            for (const questionId in groupedData) {
                if (Object.hasOwnProperty.call(groupedData, questionId)) {
                    const questionData = groupedData[questionId];

                    // 解析 questionList，找到对应问题的选项数组
                    const questionList = JSON.parse(this.$route.query.questionList);
                    const options = questionList.find(item => item.quId == questionId).option.split(';')

                    // 生成圓餅圖
                    const pieChart = new Chart(document.getElementById('pieChart_' + questionId), {
                        type: 'pie',
                        data: {
                            labels: options,
                            datasets: [{
                                data: this.countOptionOccurrences(questionData, options),
                                backgroundColor: ['#4368B6', '#78A153', '#DEC23B', '#E4930A', '#C53211', '#A4B7E1', '#B8B87A', '#EFDE80', '#EFBD37', '#A85E5E'], // 可以自定義顏色
                            }],
                        },
                        options: {
                            responsive: false, // 自動調整大小
                            maintainAspectRatio: false, // 不保持長寬比
                            plugins: {
                                legend: {
                                    position: 'right',
                                },
                            },
                        },
                    });

                    // 生成長條圖
                    const barChart = new Chart(document.getElementById('barChart_' + questionId), {
                        type: 'bar',
                        data: {
                            labels: options,
                            datasets: [{
                                label: '', // 空字符串表示不显示 label
                                data: this.countOptionOccurrences(questionData, options),
                                backgroundColor: ['#4368B6', '#78A153', '#DEC23B', '#E4930A', '#C53211', '#A4B7E1', '#B8B87A', '#EFDE80', '#EFBD37', '#A85E5E'], // 可以自定義顏色
                            }],
                        },
                        options: {
                            responsive: false, // 自動調整大小
                            maintainAspectRatio: false, // 不保持長寬比
                            scales: {
                                y: {
                                    display: false, // 隱藏 y 軸
                                },

                            },
                            plugins: {
                                legend: {
                                    display: false, // 不顯示圖例
                                },
                            },
                        },
                    });
                }
            }
        },

        countOptionOccurrences(questionData, options) {
            // 初始化選項數量的數組，初始值都為 0
            const optionCounts = Array(options.length).fill(0);

            // 遍歷 questionData，統計每個選項的數量
            questionData.forEach(entry => {
                const optionIndex = options.indexOf(entry.ans);
                if (optionIndex !== -1) {
                    optionCounts[optionIndex]++;
                }
            });

            return optionCounts;
        },

        getQuestion(questionId) {
            const questionList = JSON.parse(this.$route.query.questionList);
            const question = questionList.find(item => item.quId == questionId);
            return `${question.qTitle}  (${question.optionType})`;
        },
    },
};
</script>

<template>
    <div class="bgArea">
        <MoveToPrevious/>
        <!-- <h1>觀看統計</h1>
        <p>問卷ID: {{ $route.query.questionnaireId }}</p>
        <p>questionList: {{ $route.query.questionList }}</p> -->
        <div class="titleArea">
            <p>{{ JSON.parse($route.query.questionnaire).startDate + ' ~ ' +
                JSON.parse($route.query.questionnaire).endDate }}</p>
            <h2>{{ JSON.parse($route.query.questionnaire).title }}</h2>
            <p>{{ JSON.parse($route.query.questionnaire).description }}</p>
        </div>


        <!-- 根據使用者統計數據生成圓餅圖和長條圖 -->
        <div class="chartAreaOutside">
            <div class="chartArea" v-for="(questionIdData, questionId) in groupByQuestionId(userStatistics)"
                :key="questionId">
                <!-- <p class="questionId"> {{ ' 第 ' + questionId + ' 題 ' }}</p> -->
                <!-- 顯示對應的 qTitle -->
                <p class="idAndTitle">{{ questionId + '. ' + getQuestion(questionId) }}</p>

                <div class="canvasArea">

                    <!-- 生成圓餅圖 -->
                    <canvas class="pieChart" :id="'pieChart_' + questionId"></canvas>

                    <!-- 生成長條圖 -->
                    <canvas class="barChart" :id="'barChart_' + questionId"></canvas>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.bgArea {
    width: 100vw;
    background-color: #f4f4ed;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: absolute;

    .titleArea {
        width: 60%;
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: #ffffff;
        font-weight: 700;
        border-radius: 10px;
        box-shadow: 0px 0px 8px 1px rgba(0, 0, 0, 0.28);
        padding-top: 15px;
        margin: 2% 0;
    }

    .chartAreaOutside {
        width: 60%;
        background-color: #fff;
        padding: 2% 2% 1% 2%;
        border-radius: 10px;
        margin-bottom: 2%;
        box-shadow: 0px 0px 8px 1px rgba(0, 0, 0, 0.28);

        .chartArea {
            border: 2px solid #ede9e6;
            border-radius: 10px;
            margin-bottom: 2%;

            .idAndTitle{
                margin: 20px 0 -10px 20px;
                font-weight: 700;
            }

            .canvasArea {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: center;

                .pieChart {
                    width: 350px;
                    height: 350px;
                }

                .barChart {
                    margin-top: 100px;
                    max-height: 350px;
                }


            }
        }
    }
}
</style>
